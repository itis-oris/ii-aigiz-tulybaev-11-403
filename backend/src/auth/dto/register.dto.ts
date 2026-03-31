import {IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class RegisterRequest {
    @IsString({ message: 'Имя должно быть строкой' })
    @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
    @IsOptional()
    firstname?: string;

    @IsString({ message: 'Фамилия должна быть строкой' })
    @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
    @IsOptional()
    lastname?: string;

    @IsString({ message: 'Отчество должно быть строкой' })
    @MaxLength(50, { message: 'Отчество не должно превышать 50 символов' })
    @IsOptional()
    middlename?: string;

    @IsString({ message: 'Почта должна быть строкой' })
    @IsNotEmpty({ message: 'Почта обязательна для заполнения' })
    @IsEmail({}, { message: 'Некорректный формат электронной почты' })
    email: string;

    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
    @MinLength(6, { message: 'Пароль должен занимать не менее 6 символов' })
    @MaxLength(128, { message: 'Пароль не должен быть больше 128 символов' })
    password: string;
}
