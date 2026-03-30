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
    @ApiPropertyOptional({ example: 'Refine task API' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: 'Update only changed fields' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 8 })
    @IsInt()
    @IsOptional()
    storyPoints?: number;

    @ApiPropertyOptional({ example: 1 })
    @IsInt()
    @IsOptional()
    priority?: number;

    @ApiPropertyOptional({ example: '2026-03-26T09:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440010' })
    @IsUUID()
    @IsOptional()
    columnId?: string;

    @ApiPropertyOptional({
        example: '2000',
        description: 'Task position inside the column as a non-negative integer string',
    })
    @IsOptional()
    @Matches(/^\d+$/, {
        message: 'position must be a non-negative integer string',
    })
    position?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440011' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440012' })
    @IsUUID()
    @IsOptional()
    boardId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440013' })
    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
