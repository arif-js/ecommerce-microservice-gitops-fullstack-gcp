'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
    return (
        <section className="relative py-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-[500px] bg-blue-500/10 blur-[120px]" />
            <div className="text-center space-y-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent leading-tight"
                >
                    The Future of <br /> Commerce.
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed"
                >
                    Experience a slick, simple, and hyper-scalable platform designed for the next generation of digital commerce.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-4"
                >
                    <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-white/90">
                        Explore Collection <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-full px-8 bg-transparent border-white/10 text-white hover:bg-white/5">
                        Learn More
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
