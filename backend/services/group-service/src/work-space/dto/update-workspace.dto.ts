/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsUUID('4', { message: 'workspaceId must be a valid UUID v4' })
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'description must not exceed 500 characters' })
  description?: string;
}
