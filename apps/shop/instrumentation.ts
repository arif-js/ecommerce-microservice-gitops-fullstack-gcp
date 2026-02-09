export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initOTel } = await import('@repo/otel');
        initOTel('shop-frontend');
    }
}
