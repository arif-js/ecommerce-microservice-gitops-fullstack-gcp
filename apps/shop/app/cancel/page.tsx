'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CancelPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[3.5rem] text-center backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                    <XCircle className="text-red-400 w-12 h-12" />
                </motion.div>

                <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Payment Cancelled</h1>
                <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                    Your payment was not completed. No charges were made to your account.
                </p>

                <Link href="/" className="block">
                    <Button className="w-full bg-white text-black py-7 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all duration-500 text-lg">
                        <ArrowLeft size={20} />
                        Back to Shop
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
