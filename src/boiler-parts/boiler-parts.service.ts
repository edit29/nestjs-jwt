import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from '@prisma/client';

@Injectable()
export class BoilerPartsService {
  constructor(
      private readonly prismaService: PrismaService
  ){}
  async findAll() {
    return await this.prismaService.product.findMany({
      where: {
        isAvailable: true,
        },
        orderBy:{
          createdAt: "desc",
        },
          select:{
            id: true,
            name: true,
            year: true,
            price: true,
            tag: true,
            bestseller: true

          }
        });
    } 

    async findById(id: string): Promise<Product>{
            const product = await this.prismaService.product.findUnique({
                where:{
                    id,
                },
                include:{
                    poster:true,
                }
            });
    
            if(!product || !product.isAvailable) throw new NotFoundException('Фильм не найден ');
    
            return product;
        }

    async findByTag(tag: string): Promise<Product[]> {
        return this.prismaService.product.findMany({
          where: {
            tag: {
              contains: tag, 
              mode: 'insensitive',
            },
          },
        });
      }

    async findByName(name: string): Promise<Product[]> {
        return this.prismaService.product.findMany({
          where: {
            name: {
              contains: name, 
              mode: 'insensitive', 
            },
          },
        });
      }
}
