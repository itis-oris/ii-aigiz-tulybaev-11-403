import {IsOptional, IsUUID} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssigneeTaskDto {
    @ApiPropertyOptional({
        example: '550e8400-e29b-41d4-a716-446655440030',
        description: 'Передай идентификатор пользователя для назначения. Оставь поле пустым, чтобы снять исполнителя.',
    })
    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
