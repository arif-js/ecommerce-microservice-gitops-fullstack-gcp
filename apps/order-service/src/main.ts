import { initOTel } from '@repo/otel';

// Initialize OTel before anything else
initOTel('order-service');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule);
        app.enableCors();
        const port = process.env.PORT || 8080;
        await app.listen(port, '0.0.0.0');
        console.log(`Service is running on port: ${port}`);
    } catch (error) {
        console.error('FATAL STARTUP ERROR:', error);
        process.exit(1);
    }
}
bootstrap();
