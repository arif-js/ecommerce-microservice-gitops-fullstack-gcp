'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image?: string;
}

export function ProductList({ products }: { products: Product[] }) {
    const { user } = useUser();
    const { getToken } = useAuth();

    const handleCheckout = async (product: Product) => {
        if (!user) {
            alert('Please sign in to checkout');
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch('/payment/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clerkId: user.id,
                    frontendUrl: window.location.origin,
                    items: [
                        {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                        },
                    ],
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    const productImages: Record<string, string> = {
        'Classy Green Woman Dress': 'https://images.unsplash.com/flagged/photo-1585052201332-b8c0ce30972f?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&q=80&w=800',
        'Cyber Glass Pro': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
        'Void Runner X': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'Titanium Shell Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
        'Nebula Watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="group relative overflow-hidden bg-white/5 border-white/5 hover:border-white/10 transition-all duration-500 rounded-[2.5rem]">
                        <CardHeader className="p-0">
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <img
                                    src={productImages[product.name] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'}
                                    alt={product.name}
                                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-white tracking-tight">{product.name}</h3>
                                <span className="text-lg font-medium text-blue-400">$ {product.price}</span>
                            </div>
                            <CardDescription className="text-slate-400 line-clamp-2">
                                {product.description}
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button
                                onClick={() => handleCheckout(product)}
                                className="w-full bg-white text-black py-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all duration-500"
                            >
                                <ShoppingCart size={18} />
                                Checkout Now
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            ))}
        </section>
    );
}
