import {IsEnum, IsInt, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";
import {TaskStatus} from "../../../generated/prisma/enums";

export class GetTasksDto {
    @IsOptional()
    @Type(() => Number) // Преобразует строку из URL в число
    @IsInt()
    storyPoints?: number;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsString()
    search?: string;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    priority?: number;
}