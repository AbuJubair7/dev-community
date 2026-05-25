import { IsNotEmpty, IsOptional } from 'class-validator';
import { InviteStatus } from '../enums/invite-status.enum';

export class CreateRequestDto {
  @IsNotEmpty()
  communityId!: string;

  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  status?: InviteStatus;
}
