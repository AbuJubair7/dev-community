import { IsNotEmpty, IsOptional } from 'class-validator';
import { InviteStatus } from '../enums/invite.enum';

export class CreateInviteDto {
  @IsNotEmpty()
  communityId!: string;

  @IsNotEmpty()
  inviterId!: string;

  @IsNotEmpty()
  inviteeId!: string;

  @IsOptional()
  status?: InviteStatus;
}
