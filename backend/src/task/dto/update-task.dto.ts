import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
    @ApiPropertyOptional({ example: 'Доработать API задач', description: 'Новый заголовок задачи' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: 'Обновить только изменённые поля', description: 'Новое описание задачи' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 8, description: 'Новое значение story points' })
    @IsInt()
    @IsOptional()
    storyPoints?: number;

    @ApiPropertyOptional({ example: 1, description: 'Новый приоритет задачи' })
    @IsInt()
    @IsOptional()
    priority?: number;

    @ApiPropertyOptional({ example: '2026-03-26T09:00:00.000Z', description: 'Новый срок выполнения в формате ISO 8601' })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440010', description: 'Новый идентификатор колонки' })
    @IsUUID()
    @IsOptional()
    columnId?: string;

    @ApiPropertyOptional({
        example: '2000',
        description: 'Позиция задачи внутри колонки в виде строки с неотрицательным целым числом',
    })
    @IsOptional()
    @Matches(/^\d+$/, {
        message: 'position должно быть строкой с неотрицательным целым числом',
    })
    position?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440011', description: 'Новый идентификатор проекта' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440012', description: 'Новый идентификатор доски' })
    @IsUUID()
    @IsOptional()
    boardId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440013', description: 'Новый идентификатор исполнителя' })
    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
