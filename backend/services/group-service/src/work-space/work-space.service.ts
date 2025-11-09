import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { Prisma } from '@prisma/client';
import { GetWorkspacesDto } from './dto/getall-workspaces.db';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { GetOrDeleteWorkspaceDto } from './dto/get-workspace-by-id.dto';

@Injectable()
export class WorkSpaceService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
          },
        },
      },
    });
    return workspace;
  }

  async getAllWorkSpaces(params: GetWorkspacesDto) {
    const { cursor, limit = 10, memberId, ownerId, search } = params;
    const where: Prisma.WorkspaceWhereInput = {};

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (memberId) {
      where.members = {
        some: {
          userId: memberId,
        },
      };
    }
    const take = Number(limit);
    const workspaces = await this.prisma.workspace.findMany({
      where,
      take: take + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
      include: {
        members: true,
      },
    });

    let nextCursor: string | null = null;
    if (workspaces.length > take) {
      const nextItem = workspaces.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      data: workspaces,
      pagination: {
        nextCursor,
        limit: 10,
      },
    };
  }
  async getWorkSpaceById(data: GetOrDeleteWorkspaceDto) {
    const { id } = data;
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: true,
        groups: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return workspace;
  }
  async updateWorkSpace(data: UpdateWorkspaceDto) {
    const { id, ...others } = data;
    const updated = await this.prisma.workspace.update({
      where: { id },
      data: others,
    });

    return updated;
  }
  async deleteWorkSpace() {}
  async addMember() {}
  async removeMember() {}
}
