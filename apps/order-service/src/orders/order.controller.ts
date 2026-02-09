import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('orders')
@UseGuards(ClerkGuard)
export class OrderController {
    @Post()
    async createOrder(@Body() body: any) {
        // Logic to create order in DB via Prisma
        return { id: 'order-123', status: 'PENDING' };
    }

    @Get(':id')
    async getOrder(@Param('id') id: string) {
        return { id, status: 'PAID' };
    }
}
