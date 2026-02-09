import { initOTel } from '@repo/otel';

// Initialize OTel before anything else
initOTel('order-service');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(process.env.PORT || 3002, '0.0.0.0');
    console.log(`Order service is running on: ${await app.getUrl()}`);
}
bootstrap();
