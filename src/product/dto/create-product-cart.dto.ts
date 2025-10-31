import { ApiProperty } from "@nestjs/swagger";
import {IsString, IsNotEmpty, IsInt, Min, Max, IsNumber, IsUUID, IsArray, IsUrl, IsEnum, IsOptional, IsPort} from "class-validator";

export class CreateProductCartDto {
    @ApiProperty({
        description: 'Название товара',
        example: 'Steersman Whiskey',
    })
    @IsNotEmpty({ message: "Наименование не должно быть пустым" })
    @IsString({ message: "Наименование должно быть типа string" })
    name: string;
    
    @ApiProperty({
        description: 'Год розлива',
        example: "2025",
    })
    @IsOptional()
    @IsString({message: "Год должен быть типа string"})
    year?: string | null;

    @ApiProperty({
        description: 'Стоимость товара',
        example: 999.99,
    })
    @Min(0)
    @IsNotEmpty({ message: "Стоимость товара не должна быть пустой"})
    @IsNumber()
    price: number;
    
    @ApiProperty({
        description: 'Количество товара на складе',
        example: 100,
    })
    @Min(0)
    @IsNumber()
    @IsNotEmpty({ message: "Количество товара не должно быть пустым"})
    in_stock: number;

    @ApiProperty({
        description: 'Тип товара',
        example: "Whiskey",
    })
    @IsString()
    tag: string;

    @ApiProperty({
        description: 'Изображение товара типа URL',
        example: "https://avatars.githubusercontent.com/u/229476108?v=4&size=40",
    })
    @IsUrl()
    @IsOptional()
    imageUrl?: string | null;

    @ApiProperty({
        description: 'Описание товара',
        example: 'Виски Steersman 2021 года, 0.7л',
        required: false, // Описание может быть необязательным
    })
    @IsOptional()
    @IsString({message: "Desc must be string"})
    description?: string | null;
}