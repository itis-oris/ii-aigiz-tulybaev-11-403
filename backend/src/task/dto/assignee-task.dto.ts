import {IsOptional, IsUUID} from 'class-validator';

export class AssigneeTaskDto {
    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}
