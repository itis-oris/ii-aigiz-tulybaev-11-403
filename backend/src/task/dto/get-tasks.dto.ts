import {IsEnum, IsInt, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";
import {TaskStatus} from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTasksDto {
    @ApiPropertyOptional({ example: 3, description: 'Фильтр по story points' })
    @IsOptional()
    @Type(() => Number) // Преобразует строку из URL в число
    @IsInt()
    storyPoints?: number;

    @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO, description: 'Фильтр по статусу задачи' })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiPropertyOptional({ example: 'api задач', description: 'Поиск по заголовку задачи' })
    @IsOptional()
    @IsString()
    search?: string;


    @ApiPropertyOptional({ example: 2, description: 'Фильтр по приоритету' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    priority?: number;
}
