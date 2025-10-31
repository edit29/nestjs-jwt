import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ArticleNumberService } from 'src/article-number/article-number.service';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthCartService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly boilerService: BoilerPartsService,
        private readonly articleService: ArticleNumberService,
    ){}

     // --- Операции с корзиной (корзина для каждого пользователя сохраняется как заказ со статусом "корзина") ---
        async getCart(userId: string) {
            const order = await (this.prismaService as any).order.findFirst({
                where: { 
                    userId, 
                    status: 'cart' 
                },
                include: { 
                    items: true
                 },
            });

            if (!order) 
                return { items: [], total: 0 };
            return order;
        }

        async addToCart(userId: string, dto: { productId: string; quantity: number }) {
            const { productId, quantity } = dto;

            const product = await this.prismaService.product.findUnique({ 
                where: 
                { id: 
                    productId 
                } });
            if (!product) throw new NotFoundException('Товар не найден');
            if (product.in_stock < quantity) throw new BadRequestException('Недостаточно товара на складе');

            let order = await (this.prismaService as any).order.findFirst({ 
                where: { 
                    userId,
                    status: 'cart' }, 
                    include: { 
                        items: true 
                    } });

            if (!order) {
                order = await (this.prismaService as any).order.create({ 
                    data: 
                    { 
                        userId, 
                        total: 0, 
                        currency: 'RUB', 
                        status: 'cart' 
                    } });
            }

            const existing = await (this.prismaService as any).orderItem.findFirst({ 
                where: { 
                    orderId: 
                        order.id, 
                        productId 
                } });

            if (existing) {
                const newQty = existing.quantity + quantity;
                await (this.prismaService as any).orderItem.update({ 
                    where: { 
                        id: existing.id 
                    }, 
                        data: { 
                            quantity: newQty, 
                            price: Number(product.price) 
                        } });
            } else {
                await (this.prismaService as any).orderItem.create({ 
                    data: { orderId: order.id, 
                        productId, 
                        name: product.name, 
                        price: Number(product.price), 
                        quantity } });
            }

            // Пересчет общей стоимости корзины
            const items = await (this.prismaService as any).orderItem.findMany({ 
                where: { 
                    orderId: order.id 
                } });
            const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
            await (this.prismaService as any).order.update({ 
                where: { 
                    id: order.id 
                }, data: { 
                    total 
                } });

            return (this.prismaService as any).order.findUnique({ 
                where: { 
                    id: order.id }, 
                include: { 
                    items: true 
                } });
        }

        async updateCartItem(userId: string, dto: { productId: string; quantity: number }) {
            const { productId, quantity } = dto;
            const order = await (this.prismaService as any).order.findFirst({ 
                where: { 
                    userId, status: 'cart' 
                }, 
                include: { 
                    items: true 
                } });
            if (!order) throw new NotFoundException('Корзина не найдена');

            const item = await (this.prismaService as any).orderItem.findFirst({ 
                where: { 
                    orderId: order.id, 
                    productId 
                } });
            if (!item) throw new NotFoundException('Товар не найден в корзине');

            if (quantity <= 0) {
                await (this.prismaService as any).orderItem.delete({ 
                    where: { 
                        id: item.id 
                    } });
            } else {
                // Check stock
                const product = await this.prismaService.product.findUnique({ 
                    where: { 
                        id: productId 
                    } });
                if (!product) throw new NotFoundException('Товар не найден');
                if (product.in_stock < quantity) throw new BadRequestException('Недостаточно товара на складе');

                await (this.prismaService as any).orderItem.update({ 
                    where: { 
                        id: item.id 
                    }, 
                    data: { 
                        quantity, 
                        price: Number(product.price) 
                    } });
            }

            const items = await (this.prismaService as any).orderItem.findMany({ 
                where: { 
                    orderId: order.id 
                } });
            const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
            await (this.prismaService as any).order.update({ 
                where: { 
                    id: order.id 
                }, 
                data: { 
                    total 
                }});

            return (this.prismaService as any).order.findUnique({ 
                where: { 
                    id: order.id 
                }, 
                include: { 
                    items: true 
                } });
        }

        async removeFromCart(userId: string, productId: string) {
            const order = await (this.prismaService as any).order.findFirst({ 
                where: { 
                    userId, 
                    status: 'cart' }, 
                include: { 
                    items: true 
                } });
            if (!order) throw new NotFoundException('Корзина не найдена');
            const item = await (this.prismaService as any).orderItem.findFirst({ 
                where: { 
                    orderId: order.id, 
                    productId 
                } });
            if (!item) throw new NotFoundException('Товар в корзине не найден');
            await (this.prismaService as any).orderItem.delete({ 
                where: { 
                    id: item.id
                 } });

            const items = await (this.prismaService as any).orderItem.findMany({ 
                where: { 
                    orderId: order.id 
                } });
            const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
            await (this.prismaService as any).order.update({ 
                where: { 
                    id: order.id 
                }, 
                data: { 
                    total 
                } });

            return (this.prismaService as any).order.findUnique({ 
                where: { 
                    id: order.id 
                }, 
                include: { 
                    items: true 
                } });
        }
}
