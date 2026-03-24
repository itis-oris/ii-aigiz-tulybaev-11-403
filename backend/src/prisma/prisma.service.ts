import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import {PrismaClient} from "../../generated/prisma/client";

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor() {
        const connectionString = process.env.POSTGRES_URI;

        if (!connectionString) {
            throw new Error('POSTGRES_URI is not configured');
        }

        super({
            adapter: new PrismaPg({
                connectionString,
            }),
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
