import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import {TaskModule} from "./task/task.module";
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "./auth/auth.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        TaskModule,
        AuthModule
    ],
})
export class AppModule {}
