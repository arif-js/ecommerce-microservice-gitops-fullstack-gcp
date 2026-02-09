import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Slick Shop',
    description: 'Premium Microservices E-commerce',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <ClerkProvider>
                <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
                    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                            <Link href="/" className="hover:opacity-80 transition-opacity">
                                <h1 className="text-xl font-bold tracking-tighter">SLICK.</h1>
                            </Link>
                            <div className="flex items-center gap-4">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className="text-sm font-medium hover:text-blue-400 transition-colors">Sign In</button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link href="/orders" className="text-sm font-medium hover:text-blue-400 transition-colors mr-2"> My Orders </Link>
                                    <UserButton afterSignOutUrl="/" />
                                </SignedIn>
                            </div>
                        </nav>
                    </header>
                    <main className="pt-24 min-h-screen">
                        {children}
                    </main>
                    <footer className="border-t border-white/5 py-12 mt-20 bg-slate-900/50">
                        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
                            &copy; 2026 Slick Shop. Built with Next.js 15 & NestJS 11.
                        </div>
                    </footer>
                </body>
            </ClerkProvider>
        </html>
    );
}
