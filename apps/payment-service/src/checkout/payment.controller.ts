import { Controller, Post, Body, Headers, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ClerkGuard } from '../auth/clerk.guard';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentController {
    private stripe: Stripe;

    constructor(private prisma: PrismaService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16' as any,
        });
    }

    @Post('checkout')
    @UseGuards(ClerkGuard)
    async createCheckoutSession(@Body() body: { items: any[], clerkId: string, frontendUrl?: string }, @Req() req: any) {
        // 1. Find or sync user
        let user = await this.prisma.user.findUnique({
            where: { clerkId: body.clerkId }
        });

        if (!user) {
            throw new UnauthorizedException('User not found in database');
        }

        // 2. Manage Stripe Customer
        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            // Search Stripe for existing customer with this email to avoid duplicates
            const existingCustomers = await this.stripe.customers.list({
                email: user.email,
                limit: 1,
            });

            if (existingCustomers.data.length > 0) {
                stripeCustomerId = existingCustomers.data[0].id;
                console.log('Linked existing Stripe customer during checkout:', stripeCustomerId);
            } else {
                const customer = await this.stripe.customers.create({
                    email: user.email,
                    name: user.name || undefined,
                    metadata: {
                        clerkId: user.clerkId,
                    },
                });
                stripeCustomerId = customer.id;
                console.log('Created new Stripe customer during checkout:', stripeCustomerId);
            }

            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId },
            });
        }

        const frontendUrl = body.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
        const total = body.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 3. Create Order
        const order = await this.prisma.order.create({
            data: {
                userId: user.id,
                total,
                status: 'PENDING',
                items: {
                    create: body.items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                    }))
                }
            }
        });

        // 4. Create Stripe Session
        const session = await this.stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: body.items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            client_reference_id: order.id,
            success_url: `${frontendUrl}/success`,
            cancel_url: `${frontendUrl}/cancel`,
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Session expires in 30 mins
        });

        // 5. Save Session info to Order
        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                stripeSessionId: session.id,
                stripeSessionUrl: session.url
            },
        });

        return { url: session.url };
    }

    @Post('webhook')
    async handleWebhook(
        @Headers('stripe-signature') sig: string,
        @Req() req: any,
        @Res() res: any
    ) {
        console.log('Incoming Webhook Headers:', JSON.stringify(req.headers));
        console.log('Webhook received! Signature:', sig ? 'Present' : 'Missing');
        let event;

        try {
            event = this.stripe.webhooks.constructEvent(
                req.rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error('Webhook Error!', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.client_reference_id;

            if (orderId) {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'PAID' }
                });
                console.log('Order marked as PAID:', orderId);
            }
        } else if (event.type === 'checkout.session.expired') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.client_reference_id;

            if (orderId) {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'CANCELLED' }
                });
                console.log('Order marked as CANCELLED (session expired):', orderId);
            }
        }

        res.json({ received: true });
    }
}
