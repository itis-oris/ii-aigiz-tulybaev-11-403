import { IsOptional, IsUUID, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MoveTaskDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
    @IsUUID()
    columnId: string;

    @ApiPropertyOptional({
        example: '3000',
        description: 'New task position inside the target column',
    })
    @IsOptional()
    @Matches(/^\d+$/, {
        message: 'position must be a non-negative integer string',
    })
    position?: string;
}
