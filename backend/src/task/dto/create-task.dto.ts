import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
    @ApiProperty({ example: 'Реализовать API для задач', description: 'Краткий заголовок задачи' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Создать контроллер, сервис и валидацию DTO', description: 'Подробное описание задачи' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 5, description: 'Оценка задачи в story points' })
    @IsInt()
    @IsOptional()
    storyPoints?: number;

    @ApiPropertyOptional({ example: 2, description: 'Приоритет задачи' })
    @IsInt()
    @IsOptional()
    priority?: number;

    @ApiPropertyOptional({ example: '2026-03-25T12:00:00.000Z', description: 'Срок выполнения в формате ISO 8601' })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Идентификатор колонки, в которую создаётся задача' })
    @IsUUID()
    columnId: string;

    @ApiPropertyOptional({
        example: '1000',
        description: 'Позиция задачи внутри колонки в виде строки с неотрицательным целым числом',
    })
    @IsOptional()
    @Matches(/^\d+$/, {
        message: 'position должно быть строкой с неотрицательным целым числом',
    })
    position?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Идентификатор проекта' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'Идентификатор доски' })
    @IsUUID()
    @IsOptional()
    boardId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440003', description: 'Идентификатор исполнителя' })
    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
