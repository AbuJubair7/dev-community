import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunityEntity } from './pg-entities/community.entity';
import { CommunityMemberEntity } from './pg-entities/community-member.entity';
import { CommunityInviteEntity } from './pg-entities/community-invite.entity';
import { CommunityRequestEntity } from './pg-entities/community-request.entity';
import { UserEntity } from '../users/pg-entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityEntity,
      CommunityMemberEntity,
      CommunityInviteEntity,
      CommunityRequestEntity,
      UserEntity,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
