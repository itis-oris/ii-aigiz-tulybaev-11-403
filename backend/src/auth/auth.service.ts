import {ConflictException, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {RegisterRequest} from "./dto/register.dto";
import * as argon2 from 'argon2'
import {Prisma} from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async register(dto: RegisterRequest) {
        let {firstname, lastname, middlename, email, password} = dto;

        email = email.trim().toLowerCase();

        const passwordHash = await argon2.hash(password);

        try {
            return await this.prismaService.user.create({
                data: {
                    firstname,
                    lastname,
                    middlename,
                    email,
                    passwordHash,
                },
                select: {
                    id: true,
                    firstname: true,
                    email: true,
                    middlename: true,
                    lastname: true,
                    createdAt: true
                }
            });
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
}
