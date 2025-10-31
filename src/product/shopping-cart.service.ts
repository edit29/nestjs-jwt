import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductCartDto } from './dto/create-product-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product, ProductPoster } from '@prisma/client';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { ArticleNumberService } from 'src/article-number/article-number.service';
import { NotificationService } from '../notification/notification.service';
import { UpdateCartProductDto } from './dto/update-product-cart.dto';

@Injectable()
export class ShoppingService {
    constructor(
    private readonly prismaService: PrismaService,
    private readonly boilerService: BoilerPartsService,
    private readonly articleService: ArticleNumberService,
    private readonly notificationService: NotificationService,
){}
    
    // async findAll() {
    //     return await this.prismaService.product.findMany({
    //         where: {
    //             isAvailable: true,
    //         },
    //         orderBy:{
    //             createdAt: "desc",
    //         },
    //         select:{
    //             id: true,
    //             name: true,
    //             year: true,
    //             price: true,
    //             tag: true,
    //             bestseller: true

    //         }
    //     });
    // } 
    
    async create(dto: CreateProductCartDto): Promise<Product> {
        const {name, year, tag, description, imageUrl, price, in_stock} = dto;
        
        const uniqueArticle = await this.articleService.generateUniqueArticleNumber();

        const product = await this.prismaService.product.create({
            data:{
                articleNumber: uniqueArticle,
                tag,
                name,
                year,
                price,
                in_stock,
                description,
                poster: imageUrl 
                    ? {
                        create: {
                            url: imageUrl
                        },
                    }
                    : undefined,
                
            },
        });

        return product;
    }

    // async findById(id: string): Promise<Product>{
    //     const product = await this.prismaService.product.findUnique({
    //         where:{
    //             id,
    //         },
    //         include:{
    //             poster:true,
    //         }
    //     });

    //     if(!product || !product.isAvailable) throw new NotFoundException('Фильм не найден ');

    //     return product;
    // }

    // async updateCart(id:string, dto: CreateProductCartDto): Promise<string>{
    //     const product = await this.boilerService.findById(id);

    //     await this.prismaService.product.update({
    //         where:{
    //             id: product.id,
    //         },
    //         data:{
    //             name: dto.name,
    //             tag: dto.tag,
    //             price: dto.price,
    //             in_stock: dto.in_stock,
    //             year: dto.year,
    //             description: dto.description,
    //             poster: dto.imageUrl 
    //                 ? {
    //                     create: {
    //                         url: dto.imageUrl
    //                     },
    //                 }
    //                 : undefined,
    //     }});
    //     return `Карточка товара: ${product.name} была обновлена`;
    // }

    async updateCart(id:string, dto: UpdateCartProductDto){
        const product = await this.boilerService.findById(id);

        await this.prismaService.product.update({
            where:{
                id: product.id,
            },
            data: dto});

        return this.prismaService.product.findUnique({
            where: { id },
            include: { poster: true},
            });
    }

    // async updateCount(id:string, dto: UpdateCountProductDto): Promise<string>{
    //     const product = await this.boilerService.findById(id);

    //     await this.prismaService.product.update({
    //         where:{
    //             id: product.id,
    //         },
    //         data:{
    //             in_stock: dto.in_stock,
    //     }});
    //     return `Количество товара: ${product.name} было обновлено на ${dto.in_stock}`;
    // }

    async deleteById(id:string): Promise<string>{
        const product = await this.boilerService.findById(id);

        await this.prismaService.product.delete({
            where:{
                id: product.id,
            }
        });

        return `Товар ${product.name} с артикулом ${product.articleNumber} удалён к хуям`;
    }
//     async findByTag(tag: string): Promise<Product[]> {
//     return this.prismaService.product.findMany({
//       where: {
//         tag: {
//           contains: tag, 
//           mode: 'insensitive',
//         },
//       },
//     });
//   }

//   async findByName(name: string): Promise<Product[]> {
//     return this.prismaService.product.findMany({
//       where: {
//         name: {
//           contains: name, 
//           mode: 'insensitive', 
//         },
//       },
//     });
//   }
}
