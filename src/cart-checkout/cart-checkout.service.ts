import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { ArticleNumberService } from 'src/article-number/article-number.service';
import { NotificationService } from '../notification/byTelegramBot/notification.service';
import { NotificationByTgPersonalService } from '../notification/byTelegramPersonal/notification-by-tg-personal.service';

@Injectable()
export class CartCheckoutService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly boilerService: BoilerPartsService,
        private readonly articleService: ArticleNumberService,
        private readonly notificationService: NotificationService,
        private readonly adminNotificationService: NotificationByTgPersonalService,
    ){}


     // Checkout: convert cart -> created order and send product card via WhatsApp
    async checkout(userId: string, dto: { message?: string }) {
        const { message } = dto;
        const user = await this.prismaService.user.findUnique({ 
            where:{
                id:userId 
            },
            select:{
                telegramUsername: true,
                name: true,
                phone: true,
                email:true,
                role:true,
            }});
        const telegramUsername = "6571411732";
    
        const order = await (this.prismaService as any).order.findFirst({ where: { userId, status: 'cart' }, include: { items: true } });
        if (!order) throw new NotFoundException('Корзина не найдена');
        if (!order.items || order.items.length === 0) throw new BadRequestException('Корзина пуста');

        // Update order status to 'created'
        await (this.prismaService as any).order.update({ where: { id: order.id }, data: { status: 'создано' } });

        // Build a simple product card message (use HTML formatting for Telegram)
        const escapeMarkdown = (s: any) =>
        (s === undefined || s === null) ? '' : String(s).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

        const lines = order.items.map((i: any) => `
        *${escapeMarkdown(i.name)}* | ${escapeMarkdown(i.quantity)}шт | ${escapeMarkdown(i.price)} за каждую позицию`);
        const totalLine = `*Сумма:* ${escapeMarkdown(order.total)} ${escapeMarkdown(order.currency ?? 'RUB')}`;

        const requisites = `*Банк:* ООО Тинькофф Бнак`;

        // Bold the header and use Markdown-safe escaped values
        const body = ["*Ваш заказ:*","", "\\-\\-\\-\\-","", ...lines,"","\\-\\-\\-\\-","","*Реквизиты для оплаты:*", requisites, totalLine, "","\\-\\-\\-\\-","","*Комментарий:*", escapeMarkdown(message)].filter(Boolean).join('\n');

        console.log('TELEGRAM sending...')

        //const notifyResult = await this.notificationService.sendTelegram(telegramUsername, body);
        
        const notifyResult = await this.adminNotificationService.notifyOrderCreated(user, order);

        console.log('TELEGRAM sent...')

        // Return updated order and notification result
        const updated = await (this.prismaService as any).order.findUnique({ where: { id: order.id }, include: { items: true } });
        return { order: updated, notification: notifyResult };
        }
}
