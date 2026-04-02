import {IsEmail, IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class LoginRequest {
    @ApiProperty({
        description: 'Почтовый адрес',
        example: 'user@example.com',
        minLength: 6,
        maxLength: 1200
    })
    @IsString({ message: 'Почта должна быть строкой' })
    @IsNotEmpty({ message: 'Почта обязательна для заполнения' })
    @IsEmail({}, { message: 'Некорректный формат электронной почты' })
    email: string;

    @ApiProperty({
        description: 'Пароль от аккаунта',
        example: '123456789',
        minLength: 6,
        maxLength: 1200
    })
    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
    @MinLength(6, { message: 'Пароль должен занимать не менее 6 символов' })
    @MaxLength(128, { message: 'Пароль не должен быть больше 128 символов' })
    password: string;
}