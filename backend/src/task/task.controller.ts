import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {MoveTaskDto} from "./dto/move-task.dto";
import {GetTasksDto} from "./dto/get-tasks.dto";
import {AssigneeTaskDto} from "./dto/assignee-task.dto";

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    create(
        @Body() dto: CreateTaskDto,
        @Req() req
    ) {
        return this.taskService.create(dto, req.user.id);
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
        @Body() dto: AssigneeTaskDto,
    ) {
      return this.taskService.assignee(id, dto);
    }

    @Patch(':id/move')
    move(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: MoveTaskDto
    ) {
      return this.taskService.move(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.taskService.remove(id);
    }

    @Get()
    findAll(
        @Query() filterDto: GetTasksDto
    ) {
        return this.taskService.findAll(filterDto);
    }

    @Get(':id')
    findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.taskService.findById(id);
    }
}
