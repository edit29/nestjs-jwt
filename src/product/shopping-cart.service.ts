import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product, ProductPoster } from '@prisma/client';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';

@Injectable()
export class ShoppingService {
    constructor(
    private readonly prismaService: PrismaService,
    private readonly boilerService: BoilerPartsService,
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

    async create(dto: ProductDto): Promise<Product> {
        const {name, year, tag, description, imageUrl, price} = dto;

        const product = await this.prismaService.product.create({
            data:{
                tag,
                name,
                year,
                price,
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

    async update(id:string, dto: ProductDto): Promise<boolean>{
        const product = await this.boilerService.findById(id);

        await this.prismaService.product.update({
            where:{
                id: product.id,
            },
            data:{
                name: dto.name,
                description: dto.description,
                price: dto.price,
                poster: dto.imageUrl 
                    ? {
                        create: {
                            url: dto.imageUrl
                        },
                    }
                    : undefined,
        }});
        return true;
    }

    async deleteById(id:string): Promise<string>{
        const product = await this.boilerService.findById(id);

        await this.prismaService.product.delete({
            where:{
                id: product.id,
            }
        });

        return `Товар ${product.name} удалён к хуям`;
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
