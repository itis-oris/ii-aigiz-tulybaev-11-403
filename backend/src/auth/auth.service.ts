import {ConflictException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {RegisterRequest} from "./dto/register.dto";
import * as argon2 from 'argon2'
import {Prisma} from "@prisma/client";
import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import type {JwtPayload} from "./interfaces/jwt.interfaces";
import {LoginRequest} from "./dto/login.dto";
import {verify} from "argon2";
import type { Response, Request } from 'express';
import {isDev} from "../utils/is-dev.utils";
import ms from 'ms';

type TokenTtl = number | import('ms').StringValue;

@Injectable()
export class AuthService {
    private readonly JWT_ACCESS_TOKEN_TTL: TokenTtl;
    private readonly JWT_REFRESH_TOKEN_TTL: TokenTtl;

    private readonly COOKIE_DOMAIN: string;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService:  ConfigService,
        private readonly jwtService: JwtService
    ) {
        this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<TokenTtl>('JWT_ACCESS_TOKEN_TTL');
        this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<TokenTtl>('JWT_REFRESH_TOKEN_TTL');

        this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
    }

    async logout(res: Response) {
        this.setCookie(res, 'refreshToken', new Date(0));
        return true;
    }

    async register(res: Response, dto: RegisterRequest) {
        let {firstname, lastname, middlename, email, password} = dto;

        email = email.trim().toLowerCase();

        try {
            const user = await this.prismaService.user.create({
                data: {
                    firstname,
                    lastname,
                    middlename,
                    email,
                    passwordHash: await argon2.hash(password),
                }
            });

            return this.auth(res, user.id);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Пользователь с такой почтой уже существует')
            }

            throw error;
        }
    }

    async login(res: Response, dto: LoginRequest) {
        let {email, password} = dto;

        const user = await this.prismaService.user.findUnique({
            where: {
                email
            },
            select: {
                id: true,
                passwordHash: true
            }
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден')
        }

        const isValidPassword = await verify(user.passwordHash, password);

        if (!isValidPassword) {
            throw new NotFoundException('Пользователь не найден')
        }

        return this.auth(res, user.id);
    }

    private getRefreshTokenExpires(): Date {
        const ttl =
            typeof this.JWT_REFRESH_TOKEN_TTL === 'number'
                ? this.JWT_REFRESH_TOKEN_TTL * 1000
                : ms(this.JWT_REFRESH_TOKEN_TTL);

        return new Date(Date.now() + ttl);
    }

    async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException('Недействительный refresh-token')
        }

        const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

        if (payload) {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: payload.id
                },
                select: {
                    id: true
                }
            });

            if (!user) {
                throw new NotFoundException('Пользователь не найден')
            }

            return this.auth(res, user.id);
        }
    }

    private auth(res: Response, id: string) {
        const { accessToken, refreshToken } = this.generateTokens(id);

        this.setCookie(res, refreshToken, this.getRefreshTokenExpires());

        return { accessToken };
    }


    private generateTokens(id: string) {
        const payload: JwtPayload = { id };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.JWT_ACCESS_TOKEN_TTL,
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.JWT_REFRESH_TOKEN_TTL,
        });

        return {
            accessToken,
            refreshToken
        }
    }

    private setCookie(res: Response, value: string, expires: Date) {
        res.cookie('refreshToken', value, {
            httpOnly: true,
            domain: this.COOKIE_DOMAIN,
            expires,
            secure: !isDev(this.configService),
            sameSite: isDev(this.configService) ? 'none' : 'lax'
        })
    }

}
