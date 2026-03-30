import {IsEnum, IsInt, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";
import {TaskStatus} from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTasksDto {
    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @Type(() => Number) // Преобразует строку из URL в число
    @IsInt()
    storyPoints?: number;

    @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiPropertyOptional({ example: 'task api' })
    @IsOptional()
    @IsString()
    search?: string;


    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    priority?: number;
}
