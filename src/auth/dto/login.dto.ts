import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginRequest {
    @ApiProperty({
        description: 'Электронная почта пользователя',
        example: "example@gmail.com",
    })
    @IsString({message: "Почта должна быть строкой"})
    @IsEmail({}, {message: "Должна быть почта"})
    @IsNotEmpty({message: "Почта обязательна"})
    email: string;

    @ApiProperty({
        description: 'Пароль от аккаунта пользователя',
        example: "12345678",
        minLength: 8,
        maxLength: 128,
    })
    @IsString({message: "Пароль должен быть строкой"})
    @IsNotEmpty({message: "Пароль Обязателен"})
    @MaxLength(128, {message: "макс 128 символов"})
    @MinLength(8, {message: "Мин длина 8 символов"})
    password: string;
}