import { Module } from '@nestjs/common';
import { OrderController } from './orders/order.controller';

@Module({
    imports: [],
    controllers: [OrderController],
    providers: [],
})
export class AppModule { }
