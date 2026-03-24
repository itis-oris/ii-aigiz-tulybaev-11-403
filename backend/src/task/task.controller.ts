import {Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {AssignTaskDto} from "./dto/assign-task.dto";
import {MoveTaskDto} from "./dto/move-task.dto";

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    create(@Body() dto: CreateTaskDto) {
        return this.taskService.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateTaskDto
    ) {
        return this.taskService.update(id, dto);
    }

    @Patch(':id/assign')
    assign(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: AssignTaskDto,
    ) {
      return this.taskService.assign(id, dto);
    }

    @Patch(':id/move')
    move(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body dto: MoveTaskDto
    ) {
      return this.taskService.move(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.taskService.remove(id);
    }
}
