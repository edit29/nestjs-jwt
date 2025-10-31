import { ApiProperty } from "@nestjs/swagger";
import { GetCountResult } from "@prisma/client/runtime/library";
import {IsString, IsNotEmpty, IsInt, Min, Max, IsNumber, IsUUID, IsArray, IsUrl, IsEnum, IsOptional, IsPort} from "class-validator";


export class ResponseProductDto {

    @ApiProperty({
        description: 'Уникальный артикул товара (6 цифр)',
        example: '001234',
        })
    articleNumber: string; // Ваш 6-значный артикул

    @ApiProperty({
        description: 'Название товара',
        example: 'Steersman Whiskey',
        })
    name: string;
    
    @ApiProperty({
        description: 'Описание товара',
        example: 'Отличный виски',
        nullable: true,
        })
    description: string | null;

    @ApiProperty({
        description: 'Цена товара',
        example: 999.99,
        })
    price: number;

    @ApiProperty({
        description: 'Количество товара на складе',
        example: 100,
        })
    in_stock: number;

    @ApiProperty({
        description: 'Тип товара',
        example: "Whiskey",
    })
    tag: string;

    @ApiProperty({
        description: 'Популярный товар',
        example: "True",
    })
    bestseller: string;

}