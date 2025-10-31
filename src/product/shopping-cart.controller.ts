import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { ShoppingService } from './shopping-cart.service';
import { CreateProductCartDto } from './dto/create-product-cart.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { UserRole } from 'src/auth/enum/roles.enum';
import { ApiParam, ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UpdateCartProductDto } from './dto/update-product-cart.dto';

@ApiTags('Shopping-carts')
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
  @Roles(UserRole.ADMIN) // Только пользователи с ролью ADMIN могут создавать товары
  @Post()
  @ApiOperation({ summary: 'Создать новый товар' }) // Описание операции
  @ApiBody({ type: CreateProductCartDto, description: 'Данные для создания товара' }) // Описание тела запроса
  @ApiResponse({
    status: 201,
    description: 'Товар успешно создан',
    type: CreateProductCartDto, // Тип ответа при успешном создании
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера при генерации артикула или сохранении',
  })
  create(@Body() dto: CreateProductCartDto){
    return this.ProductService.create(dto);
  }


  @UseGuards(JwtGuard, RolesGuard) 
  @Roles(UserRole.ADMIN) 
  @Patch('id/:id')
  @ApiOperation({ summary: 'Обновить существующий товар' })
  @ApiParam({
    name: 'id',
    description: 'UUID товара, который нужно обновить',
    type: 'string',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiBody({ type: UpdateCartProductDto, description: 'Частичные данные для обновления товара' })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно обновлен',
    type: UpdateCartProductDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса или неверный формат ID',
  })
  update(@Param('id') id: string, @Body() dto: UpdateCartProductDto){
    return this.ProductService.updateCart(id, dto);
  }

  // @UseGuards(JwtGuard, RolesGuard) 
  // @Roles(UserRole.ADMIN) 
  // @Patch('id/:id')
  // updatePrice(@Param('id') id: string, @Body() dto: UpdatePriceProductDto){
  //   return this.ProductService.updatePrice(id, dto);
  // }

  // @UseGuards(JwtGuard, RolesGuard) 
  // @Roles(UserRole.ADMIN) 
  // @Patch('id/:id')
  // updateCount(@Param('id') id: string, @Body() dto: UpdateCountProductDto){
  //   return this.ProductService.updateCount(id, dto);
  // }

  @UseGuards(JwtGuard, RolesGuard) 
  @Roles(UserRole.ADMIN) 
  @Delete('id/:id')
  @ApiOperation({ summary: 'Удалить товар' })
  @ApiParam({
    name: 'id',
    description: 'UUID товара, который нужно удалить',
    type: 'string',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно удален',
    type: Object, // Можно вернуть пустой объект или { message: '...' }
    example: { message: 'Товар успешно удален' }
  })
  @ApiResponse({
    status: 404,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный формат ID',
  })
  deleteById(@Param('id') id: string){
    return this.ProductService.deleteById(id);
  }
}


