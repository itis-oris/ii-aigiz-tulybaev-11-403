import {Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterRequest} from "./dto/register.dto";
import {LoginRequest} from "./dto/login.dto";
import type { Request, Response } from 'express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCookieAuth,
    ApiConflictResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {AuthResponse} from "./dto/auth.dto";
import {Authorization} from "./decorators/authorization.decorator";
import {Authorized} from "./decorators/authorized.decorator";
import type {User} from "@prisma/client";

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({
        summary: 'Создание аккаунта',
        description: 'Создает новый аккаунт, выдает access token и устанавливает refreshToken в cookie'
    })
    @ApiOkResponse({ type: AuthResponse })
    @ApiBadRequestResponse({ description: 'Некорректные входные данные' })
    @ApiConflictResponse({ description: 'Пользователь с такой почтой уже существует' })
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: RegisterRequest
    ) {
        return await this.authService.register(res, dto);
    }

    @ApiOperation({
        summary: 'Вход в систему',
        description: 'Авторизует пользователя, выдает access token и устанавливает refreshToken в cookie'
    })
    @ApiOkResponse({ type: AuthResponse })
    @ApiBadRequestResponse({ description: 'Некорректные входные данные' })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: LoginRequest
    ) {
        return await this.authService.login(res, dto);
    }


    @ApiOperation({
        summary: 'Обновление токена доступа',
        description: 'Читает refreshToken из cookie и возвращает новый access token'
    })
    @ApiCookieAuth('refresh-token')
    @ApiOkResponse({ type: AuthResponse })
    @ApiUnauthorizedResponse({ description: 'Недействительный refresh-token' })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        return await this.authService.refresh(req, res);
    }

    @ApiOperation({
        summary: 'Выход из системы',
        description: 'Удаляет refreshToken из cookie'
    })
    @ApiCookieAuth('refresh-token')
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Res({ passthrough: true }) res: Response
    ) {
        return await this.authService.logout(res);
    }

    @Authorization()
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Получить текущего пользователя',
        description: 'Возвращает профиль пользователя по access token'
    })
    @ApiUnauthorizedResponse({ description: 'Требуется действительный access token' })
    @Get('@me')
    @HttpCode(HttpStatus.OK)
    async me(@Authorized() user: User) {
        return user;
    }
}
