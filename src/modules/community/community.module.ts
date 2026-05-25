import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { Community, CommunitySchema } from './entities/community.entity';
import {
  CommunityMember,
  CommunityMemberSchema,
} from './entities/community-member.entity';
import {
  CommunityInvite,
  CommunityInviteSchema,
} from './entities/community-invite.entity';
import {
  CommunityRequest,
  CommunityRequestSchema,
} from './entities/community-request.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: CommunityMember.name, schema: CommunityMemberSchema },
      { name: CommunityInvite.name, schema: CommunityInviteSchema },
      { name: CommunityRequest.name, schema: CommunityRequestSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
