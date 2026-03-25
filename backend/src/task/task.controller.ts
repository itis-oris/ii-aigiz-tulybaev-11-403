import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {MoveTaskDto} from "./dto/move-task.dto";
import {GetTasksDto} from "./dto/get-tasks.dto";
import {AssigneeTaskDto} from "./dto/assignee-task.dto";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @ApiOperation({ summary: 'Create task' })
    @ApiBody({ type: CreateTaskDto })
    @ApiBadRequestResponse({ description: 'Invalid payload or invalid task relations' })
    create(
        @Body() dto: CreateTaskDto,
        @Req() req
    ) {
        return this.taskService.create(dto, req.user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update task' })
    @ApiParam({ name: 'id', description: 'Task id', format: 'uuid' })
    @ApiBody({ type: UpdateTaskDto })
    @ApiBadRequestResponse({ description: 'Invalid payload or invalid task relations' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateTaskDto
    ) {
        return this.taskService.update(id, dto);
    }

    @Patch(':id/assign')
    @ApiOperation({ summary: 'Assign or unassign task' })
    @ApiParam({ name: 'id', description: 'Task id', format: 'uuid' })
    @ApiBody({ type: AssigneeTaskDto })
    @ApiBadRequestResponse({ description: 'Invalid assignee id' })
    @ApiNotFoundResponse({ description: 'Task or user not found' })
    assign(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: AssigneeTaskDto,
    ) {
      return this.taskService.assignee(id, dto);
    }

    @Patch(':id/move')
    @ApiOperation({ summary: 'Move task to another column' })
    @ApiParam({ name: 'id', description: 'Task id', format: 'uuid' })
    @ApiBody({ type: MoveTaskDto })
    @ApiBadRequestResponse({ description: 'Invalid target column or position' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    move(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: MoveTaskDto
    ) {
      return this.taskService.move(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete task' })
    @ApiParam({ name: 'id', description: 'Task id', format: 'uuid' })
    @ApiBadRequestResponse({ description: 'Task already deleted' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.taskService.remove(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get tasks list with filters' })
    @ApiQuery({ name: 'storyPoints', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'DONE'] })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'priority', required: false, type: Number })
    findAll(
        @Query() filterDto: GetTasksDto
    ) {
        return this.taskService.findAll(filterDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get task by id' })
    @ApiParam({ name: 'id', description: 'Task id', format: 'uuid' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.taskService.findById(id);
    }
}
