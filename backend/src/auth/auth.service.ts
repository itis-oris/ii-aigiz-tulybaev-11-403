import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {RegisterRequest} from "./dto/register.dto";
import * as argon2 from 'argon2'
import {Prisma} from "@prisma/client";
import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import {JwtPayload} from "./interfaces/jwt.interfaces";
import {LoginRequest} from "./dto/login.dto";
import {verify} from "argon2";

type TokenTtl = number | import('ms').StringValue;

@Injectable()
export class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: TokenTtl;
    private readonly JWT_REFRESH_TOKEN_TTL: TokenTtl;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService:  ConfigService,
        private readonly jwtService: JwtService
    ) {
        this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
        this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<TokenTtl>('JWT_ACCESS_TOKEN_TTL');
        this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<TokenTtl>('JWT_REFRESH_TOKEN_TTL');
    }

    async register(dto: RegisterRequest) {
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

            return this.generateTokens(user.id);
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

    async login(dto: LoginRequest) {
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

        return this.generateTokens(user.id);
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

    // private setCookie(res: Response, value: string, expires: Date) {
    //
    // }

}
