import {IsOptional, IsUUID, Matches} from "class-validator";

export class MoveTaskDto {
    @IsUUID()
    columnId: string;

    @IsOptional()
    @Matches(/^\d+$/, { message: 'position must be a non-negative integer string' })
    position?: string;
}