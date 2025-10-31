import { Controller, Get, Param, Query } from '@nestjs/common';
import { BoilerPartsService } from './boiler-parts.service';
import { Product } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ResponseProductDto } from 'src/product/dto/response-product-cart.dto';
import type { CreateProductCartDto } from 'src/product/dto/create-product-cart.dto';

@ApiTags('boiler-parts')
@Controller('find')
export class BoilerPartsController {
  ShoppingService: any;
  constructor(private readonly boilerPartsService: BoilerPartsService) {}

  // --- Методы GET ---

  @Get()
  @ApiOperation({ summary: 'Получить список всех товаров' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Фильтр по названию товара',
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    type: String,
    description: 'Фильтр по тегу товара',
  })
  @ApiResponse({
    status: 200,
    description: 'Список товаров успешно получен',
    type: [ResponseProductDto], // Указываем, что это массив ProductResponseDto
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера',
  })
  async findAll(
    @Query('name') name?: string,
    @Query('tag') tag?: string,
  ): Promise<CreateProductCartDto[]> {
    if (name) {
      return this.boilerPartsService.findByName(name);
    }
    if (tag) {
      return this.boilerPartsService.findByTag(tag);
    }
    return this.boilerPartsService.findAll();
  }

  

  @ApiOperation({ summary: 'Получить товар по его UUID' })
  @ApiParam({
    name: 'id',
    description: 'UUID товара',
    type: 'string',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно найден',
    type: ResponseProductDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный формат UUID',
  })
  @Get('id/:id')
  findById(@Param('id') id: string){
    return this.boilerPartsService.findById(id);
  }


  @ApiOperation({ summary: 'Получить товар по его TAG' })
  @ApiParam({
    name: 'tag',
    description: 'TAG товара',
    type: 'string',
    format: 'tag',
    example: 'vodka',
  })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно найден',
    type: ResponseProductDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный формат TAG',
  })
  @Get('tag/:tag')
  findByTag(@Param("tag") tag: string): Promise<Product[]>{
    return this.boilerPartsService.findByTag(tag);
  }



  @ApiOperation({ summary: 'Получить товар по его NAME' })
  @ApiParam({
    name: 'id',
    description: 'NAME товара',
    type: 'string',
    format: 'name',
    example: 'Steersman 2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно найден',
    type: ResponseProductDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный формат NAME',
  })
  @Get('name/:name')
  findByName(@Param("name") name: string): Promise<Product[]>{
    return this.boilerPartsService.findByName(name);
  }
}
