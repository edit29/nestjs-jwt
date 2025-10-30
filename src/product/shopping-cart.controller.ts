import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ShoppingService } from './shopping-cart.service';
import { ProductDto } from './dto/product.dto';
import { Product } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { UserRole } from 'src/auth/enum/roles.enum';


@Controller({
  path: 'shopping-cart'
})
export class ShoppingController {
  constructor(private readonly ProductService: ShoppingService){}
  // @Get()
  // findAll(){
  //   return this.ProductService.findAll();
  // }

  // @Get('id/:id')
  // findById(@Param('id') id: string){
  //   return this.ProductService.findById(id);
  // }

  // @Get('tag/:tag')
  // findByTag(@Param("tag") tag: string): Promise<Product[]>{
  //   return this.ProductService.findByTag(tag);
  // }

  // @Get('name/:name')
  // findByName(@Param("name") name: string): Promise<Product[]>{
  //   return this.ProductService.findByName(name);
  // }

  @UseGuards(JwtGuard, RolesGuard) // Сначала JWT аутентификация, затем проверка ролей
  @Roles(UserRole.ADMIN) // Только пользователи с ролью ADMIN могут создавать продукты
  @Post()
  create(@Body() dto: ProductDto){
    return this.ProductService.create(dto);
  }

  @UseGuards(JwtGuard, RolesGuard) 
  @Roles(UserRole.ADMIN) 
  @Put('id/:id')
  update(@Param('id') id: string, @Body() dto: ProductDto){
    return this.ProductService.update(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard) 
  @Roles(UserRole.ADMIN) 
  @Delete('id/:id')
  deleteById(@Param('id') id: string){
    return this.ProductService.deleteById(id);
  }
}


