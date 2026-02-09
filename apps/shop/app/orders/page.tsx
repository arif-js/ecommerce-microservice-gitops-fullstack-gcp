import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/');
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">No account found.</h1>
                <Link href="/" className="text-blue-400 hover:underline">Return to Shop</Link>
            </div>
        );
    }

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-400 bg-green-400/10';
            case 'PENDING': return 'text-amber-400 bg-amber-400/10';
            case 'CANCELLED': return 'text-red-400 bg-red-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Your Orders</h1>
                <p className="text-slate-400">Track and manage your recent purchases.</p>
            </header>

            {orders.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-20 text-center backdrop-blur-xl">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
                    <p className="text-slate-400 mb-8">When you buy something, it will appear here.</p>
                    <Link href="/">
                        <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all duration-300">
                            Start Shopping
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl hover:border-white/20 transition-all duration-300"
                        >
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                                <div className="space-y-1">
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <Clock size={14} />
                                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Order #{order.id.slice(0, 8)}</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-bold text-blue-400">$ {order.total.toFixed(2)}</span>
                                        {order.status === 'PENDING' && order.stripeSessionUrl && (
                                            <Link href={order.stripeSessionUrl}>
                                                <button className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg font-bold transition-all">
                                                    Pay Now
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                                            <Package size={20} className="text-slate-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white text-sm">{item.product.name}</h4>
                                            <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
