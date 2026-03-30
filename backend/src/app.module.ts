import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import {TaskModule} from "./task/task.module";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        TaskModule],
})
export class AppModule {}
