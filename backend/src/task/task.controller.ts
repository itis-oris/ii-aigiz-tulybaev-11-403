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

@ApiTags('Задачи')
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @ApiOperation({ summary: 'Создать задачу' })
    @ApiBody({ type: CreateTaskDto })
    @ApiBadRequestResponse({ description: 'Некорректные данные или неверные связи задачи' })
    create(
        @Body() dto: CreateTaskDto,
        @Req() req
    ) {
        return this.taskService.create(dto, req.user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить задачу' })
    @ApiParam({ name: 'id', description: 'Идентификатор задачи', format: 'uuid' })
    @ApiBody({ type: UpdateTaskDto })
    @ApiBadRequestResponse({ description: 'Некорректные данные или неверные связи задачи' })
    @ApiNotFoundResponse({ description: 'Задача не найдена' })
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateTaskDto
    ) {
        return this.taskService.update(id, dto);
    }

    @Patch(':id/assign')
    @ApiOperation({ summary: 'Назначить или снять исполнителя' })
    @ApiParam({ name: 'id', description: 'Идентификатор задачи', format: 'uuid' })
    @ApiBody({ type: AssigneeTaskDto })
    @ApiBadRequestResponse({ description: 'Некорректный идентификатор исполнителя' })
    @ApiNotFoundResponse({ description: 'Задача или пользователь не найдены' })
    assign(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: AssigneeTaskDto,
    ) {
      return this.taskService.assignee(id, dto);
    }

    @Patch(':id/move')
    @ApiOperation({ summary: 'Переместить задачу в другую колонку' })
    @ApiParam({ name: 'id', description: 'Идентификатор задачи', format: 'uuid' })
    @ApiBody({ type: MoveTaskDto })
    @ApiBadRequestResponse({ description: 'Некорректная колонка назначения или позиция' })
    @ApiNotFoundResponse({ description: 'Задача не найдена' })
    move(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: MoveTaskDto
    ) {
      return this.taskService.move(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Мягко удалить задачу' })
    @ApiParam({ name: 'id', description: 'Идентификатор задачи', format: 'uuid' })
    @ApiBadRequestResponse({ description: 'Задача уже удалена' })
    @ApiNotFoundResponse({ description: 'Задача не найдена' })
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.taskService.remove(id);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список задач с фильтрами' })
    @ApiQuery({ name: 'storyPoints', required: false, type: Number, description: 'Фильтр по story points' })
    @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'DONE'], description: 'Фильтр по статусу' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Поиск по названию задачи' })
    @ApiQuery({ name: 'priority', required: false, type: Number, description: 'Фильтр по приоритету' })
    findAll(
        @Query() filterDto: GetTasksDto
    ) {
        return this.taskService.findAll(filterDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить задачу по идентификатору' })
    @ApiParam({ name: 'id', description: 'Идентификатор задачи', format: 'uuid' })
    @ApiNotFoundResponse({ description: 'Задача не найдена' })
    findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.taskService.findById(id);
    }
}
