import { initOTel } from '@repo/otel';

// Initialize OTel before anything else
initOTel('payment-service');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });
    app.enableCors();
    await app.listen(process.env.PORT || 3001, '0.0.0.0');
    console.log(`Payment service is running on: ${await app.getUrl()}`);
}
bootstrap();
