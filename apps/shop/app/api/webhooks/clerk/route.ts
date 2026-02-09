import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    console.log('[Clerk Webhook] Received POST request');

    // Retrieve environment variables
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!STRIPE_SECRET_KEY || !WEBHOOK_SECRET) {
        console.error('[Clerk Webhook] Missing environment variables');
        return new Response('Configuration Error', { status: 500 });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' as any,
    });

    // Verify Svix headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error('[Clerk Webhook] Missing svix headers');
        return new Response('Error occured -- no svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('[Clerk Webhook] Error verifying webhook:', err);
        return new Response('Error occured', { status: 400 });
    }

    const eventType = evt.type;
    console.log(`[Clerk Webhook] Processing event: ${eventType}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0].email_address;
        const name = `${first_name || ''} ${last_name || ''}`.trim();

        // 1. Find or create Stripe Customer
        let stripeCustomerId: string | undefined;
        try {
            const existingUser = await prisma.user.findUnique({
                where: { clerkId: id },
            });
            stripeCustomerId = existingUser?.stripeCustomerId || undefined;

            if (!stripeCustomerId) {
                const existingCustomers = await stripe.customers.list({
                    email,
                    limit: 1,
                });

                if (existingCustomers.data.length > 0) {
                    stripeCustomerId = existingCustomers.data[0].id;
                    console.log('[Clerk Webhook] Linked existing Stripe customer:', stripeCustomerId);
                } else {
                    const customer = await stripe.customers.create({
                        email,
                        name: name || undefined,
                        metadata: { clerkId: id },
                    });
                    stripeCustomerId = customer.id;
                    console.log('[Clerk Webhook] Created new Stripe customer:', stripeCustomerId);
                }
            }
        } catch (stripeErr) {
            console.error('[Clerk Webhook] Stripe customer error:', stripeErr);
            // Continue anyway, we can sync stripe customer later
        }

        // 2. Sync with local database
        try {
            await prisma.user.upsert({
                where: { clerkId: id },
                update: { email, name, stripeCustomerId },
                create: { clerkId: id, email, name, stripeCustomerId },
            });
            console.log(`[Clerk Webhook] User synced: ${id}`);
        } catch (err: any) {
            if (err.code === 'P2002') {
                console.log('[Clerk Webhook] Conflict detected, retrying with cleanup');
                try {
                    await prisma.user.deleteMany({ where: { email } });
                    await prisma.user.create({
                        data: { clerkId: id, email, name, stripeCustomerId },
                    });
                } catch (retryErr) {
                    console.error('[Clerk Webhook] Critical retry error:', retryErr);
                }
            } else {
                console.error('[Clerk Webhook] Database error:', err);
            }
        }
    }

    return new Response('Webhook processed', { status: 200 });
}
