import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class RegisterRequest {
    @ApiProperty({
        description: 'Отображаемое имя',
        example: "John Doe",
        maxLength: 50,
    })
    @IsString({message: "Имя должно быть строкой"})
    @IsNotEmpty({message: "Имя обязательное"})
    @MaxLength(50, {message: "Макс длина имени 50 символов"})
    name: string;

    @ApiProperty({
        description: 'Почтовый адрес',
        example: "example@gmail.com",
    })
    @IsString({message: "Почта должна быть строкой"})
    @IsEmail({}, {message: "Почта должна быть почтой лол"})
    @IsNotEmpty({message: "Почта обязательна"})
    email: string;

    @ApiProperty({
        description: 'Пароль пользователя',
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