import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { Community, CommunitySchema } from './entities/community.entity';
import {
  CommunityMember,
  CommunityMemberSchema,
} from './entities/community-member.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: CommunityMember.name, schema: CommunityMemberSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
