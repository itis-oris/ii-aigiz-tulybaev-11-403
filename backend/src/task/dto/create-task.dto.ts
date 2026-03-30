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
    @ApiProperty({ example: 'Implement task API' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Create controller, service and DTO validation' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 5 })
    @IsInt()
    @IsOptional()
    storyPoints?: number;

    @ApiPropertyOptional({ example: 2 })
    @IsInt()
    @IsOptional()
    priority?: number;

    @ApiPropertyOptional({ example: '2026-03-25T12:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    columnId: string;

    @ApiPropertyOptional({
        example: '1000',
        description: 'Task position inside the column as a non-negative integer string',
    })
    @IsOptional()
    @Matches(/^\d+$/, {
        message: 'position must be a non-negative integer string',
    })
    position?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002' })
    @IsUUID()
    @IsOptional()
    boardId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440003' })
    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
