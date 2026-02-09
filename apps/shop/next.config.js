/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['@repo/otel', '@repo/database'],
    async rewrites() {
        return [
            {
                source: '/payment/:path*',
                destination: `${process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3001'}/payment/:path*`,
            },
            {
                source: '/orders/:path*',
                destination: `${process.env.ORDER_SERVICE_URL || 'http://order-service:3002'}/orders/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;