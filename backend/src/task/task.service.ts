import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {CreateTaskDto} from "./dto/create-task.dto";
import {UpdateTaskDto} from "./dto/update-task.dto";
import {MoveTaskDto} from "./dto/move-task.dto";
import {AssigneeTaskDto} from "./dto/assignee-task.dto";
import {GetTasksDto} from "./dto/get-tasks.dto";
import { Prisma } from '@prisma/client';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) {
    }

    async create(dto: CreateTaskDto, createdById: string) {

        const whereColumn: any = {
            id: dto.columnId,
        };

        if (dto.boardId || dto.projectId) {
            whereColumn.board = {}
        }

        if (dto.boardId) {
            whereColumn.board.id = dto.boardId;
        }

        if (dto.projectId) {
            whereColumn.board.projectId = dto.projectId;
        }

        const column = await this.prisma.column.findFirst({
            where: whereColumn
         });

        if (!column) {
            throw new BadRequestException('Invalid relation between column/board/project.');
        }


        if (dto.assigneeId) {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: dto.assigneeId
                }
            });

            if (!user) {
                throw new BadRequestException('Not Found User');
            }
        }


        const data = {
            title: dto.title,
            description: dto.description,
            storyPoints: dto.storyPoints,
            priority: dto.priority,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            columnId: dto.columnId,
            projectId: dto.projectId,
            boardId: dto.boardId,
            assigneeId: dto.assigneeId,
            position: dto.position ? BigInt(dto.position) : undefined,
            createdById: createdById,
        }

        return this.prisma.task.create({ data });

    }

    async update(id: string, dto: UpdateTaskDto) {

        const task = await this.prisma.task.findUnique({
            where: {
                id
            }
        });

        if (!task) {
            throw new NotFoundException('Not Found Task');
        }

        const finalColumnId = dto.columnId ?? task.columnId;
        const finalBoardId = dto.boardId ?? task.boardId;
        const finalProjectId = dto.projectId ?? task.projectId;


        const whereColumn: any = {
            id: finalColumnId,
        };

        if (finalBoardId || finalProjectId) {
            whereColumn.board = {}
        }

        if (finalBoardId) {
            whereColumn.board.id = finalBoardId;
        }

        if (finalProjectId) {
            whereColumn.board.projectId = finalProjectId;
        }

        const column = await this.prisma.column.findFirst({
            where: whereColumn
        });

        if (!column) {
            throw new BadRequestException('Invalid relation between column/board/project.');
        }

        const data: Prisma.TaskUpdateInput = {};

        if (dto.title !== undefined) {
            data.title = dto.title;
        }

        if (dto.description !== undefined) {
            data.description = dto.description;
        }

        if (dto.storyPoints !== undefined) {
            data.storyPoints = dto.storyPoints;
        }

        if (dto.priority !== undefined) {
            data.priority = dto.priority;
        }

        if (dto.dueDate !== undefined) {
            data.dueDate = new Date(dto.dueDate);
        }

        if (dto.columnId !== undefined) {
            data.column = {
                connect: { id: dto.columnId }
            }
        }

        if (dto.projectId !== undefined) {
            data.project = {
                connect: { id: dto.projectId }
            };
        }

        if (dto.boardId !== undefined) {
            data.board = {
                connect: { id: dto.boardId }
            };
        }

        if (dto.position !== undefined) {
            data.position = BigInt(dto.position);
        }

        return this.prisma.task.update({
            where: { id },
            data
        });
    }

    async move(id: string, dto: MoveTaskDto) {
        const task = await this.prisma.task.findUnique({
            where: {
                id
            }
        });

        if (!task) {
            throw new NotFoundException('Not Found Task');
        }

        const data: Prisma.TaskUpdateInput = {};

        const column = await this.prisma.column.findUnique({
            where: {
                id: dto.columnId,
            }
        });

        if (!column) {
            throw new BadRequestException('Column not found');
        }

        data.column = {
            connect: { id: dto.columnId }
        }

        if (dto.position !== undefined) {
            data.position = BigInt(dto.position);
        }

        return this.prisma.task.update({
            where: { id },
            data
        });
    }

    async assignee(id: string, dto: AssigneeTaskDto) {
        const task = await this.prisma.task.findUnique({
            where: {
                id
            }
        });

        if (!task) {
            throw new NotFoundException('Not Found Task');
        }

        const data: Prisma.TaskUpdateInput = {};

        if (dto.assigneeId !== undefined) {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: dto.assigneeId
                }
            });

            if (!user) {
                throw new BadRequestException('Not Found User');
            }
        }

        if (dto.assigneeId !== undefined) {
            data.assignee = {
                connect: { id: dto.assigneeId }
            }
        } else {
            data.assignee = {
                disconnect: true
            }
        }

        return this.prisma.task.update({
            where: { id },
            data
        });
    }

    async remove(id: string) {
        const task = await this.prisma.task.findUnique({
            where: {
                id
            }
        });

        if (!task) {
            throw new NotFoundException('Not Found Task');
        }

        if (task.deletedAt) {
            throw new BadRequestException('This task has already been deleted')
        }

        const data: Prisma.TaskUpdateInput  = {}

        data.deletedAt = new Date();

        return this.prisma.task.update({
            where: { id },
            data
        });
    }

    async findById(id: string) {
        const task = await this.prisma.task.findFirst({
            where: {
                id,
                deletedAt: null
            }
        });

        if (!task) {
            throw new NotFoundException('Not Found Task');
        }

        return task;
    }

    findAll(dto: GetTasksDto) {
        const where: Prisma.TaskWhereInput = {
            deletedAt: null,
        };

        if (dto.storyPoints !== undefined) {
            where.storyPoints = dto.storyPoints;
        }

        if (dto.status !== undefined) {
            where.status = dto.status;
        }

        if (dto.priority !== undefined) {
            where.priority = dto.priority;
        }

        if (dto.search) {
            where.OR = [
                {
                    title: {
                        contains: dto.search,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: dto.search,
                        mode: 'insensitive'
                    }
                }
            ]
        }

        return this.prisma.task.findMany({
            where,
        });
    }
}
