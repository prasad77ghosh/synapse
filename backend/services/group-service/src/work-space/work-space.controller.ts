import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth-guard/auth.guard';
import { WorkSpaceService } from './work-space.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import type { JwtRequest } from 'src/interfaces/authenticated-request.interface';

@Controller('work-space')
@UseGuards(AuthGuard)
export class WorkSpaceController {
  constructor(private readonly workspacesService: WorkSpaceService) {}

  @Post()
  async create(@Request() req: JwtRequest, @Body() dto: CreateWorkspaceDto) {
    const { userId } = req.user;
    return this.workspacesService.create(userId, dto);
  }
}
