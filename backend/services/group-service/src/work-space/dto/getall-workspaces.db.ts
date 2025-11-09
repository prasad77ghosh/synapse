/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class GetWorkspacesDto {
  @IsOptional()
  @IsUUID('4', { message: 'cursor must be a valid UUID v4' })
  cursor?: string;

  @IsOptional()
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number = 10;

  @IsOptional()
  @IsUUID('4', { message: 'ownerId must be a valid UUID v4' })
  ownerId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'memberId must be a valid UUID v4' })
  memberId?: string;

  @IsOptional()
  @IsString({ message: 'search must be a string' })
  search?: string;
}
