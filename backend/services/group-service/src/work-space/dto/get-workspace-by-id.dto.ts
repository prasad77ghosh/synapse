/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsUUID } from 'class-validator';

export class GetOrDeleteWorkspaceDto {
  @IsUUID('4', { message: 'workspaceId must be a valid UUID v4' })
  id: string;
}
