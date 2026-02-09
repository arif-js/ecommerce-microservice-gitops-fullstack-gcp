import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding products...');

    const products = [
        {
            name: 'Neural Link V1',
            description: 'Advanced neural interface for seamless connectivity.',
            price: 299,
            stock: 50,
        },
        {
            name: 'Cyber Glass Pro',
            description: 'AR glasses with zero latency and hyper-real visuals.',
            price: 999,
            stock: 30,
        },
        {
            name: 'Void Runner X',
            description: 'Performance tech-wear designed for the modern explorer.',
            price: 150,
            stock: 100,
        },
        {
            name: 'Titanium Shell Laptop',
            description: 'Ultra-durable, high-performance computing for the brave.',
            price: 2499,
            stock: 15,
        },
        {
            name: 'Nebula Watch',
            description: 'Holographic display with integrated bio-tracking.',
            price: 499,
            stock: 75,
        }
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { name: product.name },
            update: product,
            create: product,
        });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
