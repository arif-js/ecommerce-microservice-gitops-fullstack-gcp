import { motion } from 'framer-motion'; // Wait, motion is client side.
// I'll need to wrap the transitions or move them.
// Let's refactor the sections.
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductList } from '../components/ProductList';
import { PrismaClient } from '@prisma/client';
import { Hero } from '../components/Hero';

const prisma = new PrismaClient();

export default async function Home() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Rebuild Trigger 2026-02-09 */}
            <Hero />
            <ProductList products={products} />
        </div>
    );
}
