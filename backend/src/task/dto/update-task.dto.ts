import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
} from 'class-validator';

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @IsOptional()
    storyPoints?: number;

    @IsInt()
    @IsOptional()
    priority?: number;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsUUID()
    @IsOptional()
    columnId?: string;

    @IsOptional()
    @Matches(/^\d+$/, {
        message: 'position must be a non-negative integer string',
    })
    position?: string;

    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsUUID()
    @IsOptional()
    boardId?: string;

    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
