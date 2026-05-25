import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto } from './create-request.dto';

export class UpdateInviteDto extends PartialType(CreateRequestDto) {}
