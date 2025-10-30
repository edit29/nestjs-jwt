import { GetCountResult } from "@prisma/client/runtime/library";
import {IsString, IsNotEmpty, IsInt, Min, Max, IsNumber, IsUUID, IsArray, IsUrl, IsEnum, IsOptional} from "class-validator";
import { Url } from "url";

export class ProductDto {
    @IsNotEmpty({ message: "Title must be not empty" })
    @IsString({ message: "Title must be string" })
    name: string;

    @IsString()
    year: string;

    @IsNotEmpty()
    @IsString()
    price: string;

    @IsUrl()
    poster: string;

    @IsString()
    tag: string;

    @IsString()
    imageUrl: string;

    @IsString({message: "Desc must be string"})
    description: string;
}