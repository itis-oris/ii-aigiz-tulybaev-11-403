import { IsOptional, IsUUID, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MoveTaskDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020', description: 'Идентификатор целевой колонки' })
    @IsUUID()
    columnId: string;

    @ApiPropertyOptional({
        example: '3000',
        description: 'Новая позиция задачи внутри целевой колонки',
    })
    @IsOptional()
    @Matches(/^\d+$/, {
        message: 'position должно быть строкой с неотрицательным целым числом',
    })
    position?: string;
}
