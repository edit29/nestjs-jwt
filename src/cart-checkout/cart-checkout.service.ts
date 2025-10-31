import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { ArticleNumberService } from 'src/article-number/article-number.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CartCheckoutService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly boilerService: BoilerPartsService,
        private readonly articleService: ArticleNumberService,
        private readonly notificationService: NotificationService,
    ){}


     // Checkout: convert cart -> created order and send product card via WhatsApp
    async checkout(userId: string, dto: { message?: string }) {
        const { message } = dto;
        const telegramUsername = "editt29";
    
        const order = await (this.prismaService as any).order.findFirst({ where: { userId, status: 'cart' }, include: { items: true } });
        if (!order) throw new NotFoundException('Корзина не найдена');
        if (!order.items || order.items.length === 0) throw new BadRequestException('Корзина пуста');

        // Update order status to 'created'
        await (this.prismaService as any).order.update({ where: { id: order.id }, data: { status: 'создано' } });

        // Build a simple product card message
        const lines = order.items.map((i: any) => `${i.name} x${i.quantity} — ${i.price} за каждую позицию`);
        const totalLine = `Сумма: ${order.total} ${order.currency ?? 'RUB'}`;
        const body = [message, ...lines, totalLine].filter(Boolean).join('\n');

        const notifyResult = await this.notificationService.sendTelegram(telegramUsername, body);

        // Return updated order and notification result
        const updated = await (this.prismaService as any).order.findUnique({ where: { id: order.id }, include: { items: true } });
        return { order: updated, notification: notifyResult };
        }
}
