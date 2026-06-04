import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CommunityEntity } from './pg-entities/community.entity';
import { CommunityMemberEntity } from './pg-entities/community-member.entity';
import { CommunityInviteEntity } from './pg-entities/community-invite.entity';
import { CommunityRequestEntity } from './pg-entities/community-request.entity';
import { UserEntity } from '../users/pg-entities/user.entity';
import { validateUuid } from '../../helpers/validate-uuid';
import { Role } from './enums/role.enum';
import { InviteStatus } from './enums/invite-status.enum';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityEntity)
    private communityRepository: Repository<CommunityEntity>,
    @InjectRepository(CommunityMemberEntity)
    private communityMemberRepository: Repository<CommunityMemberEntity>,
    @InjectRepository(CommunityInviteEntity)
    private communityInviteRepository: Repository<CommunityInviteEntity>,
    @InjectRepository(CommunityRequestEntity)
    private communityRequestRepository: Repository<CommunityRequestEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createCommunityDto: CreateCommunityDto, creatorId: string) {
    const createdCommunity =
      this.communityRepository.create(createCommunityDto);
    const savedCommunity =
      await this.communityRepository.save(createdCommunity);
    if (!savedCommunity) {
      throw new BadRequestException('Failed to create community');
    }

    // Automatically set the creator as Admin
    const member = this.communityMemberRepository.create({
      communityId: savedCommunity._id,
      userId: validateUuid(creatorId, 'creator user id'),
      role: Role.ADMIN,
    });
    await this.communityMemberRepository.save(member);

    return savedCommunity;
  }

  async findAll() {
    return await this.communityRepository.find();
  }

  async findOne(id: string) {
    validateUuid(id, 'community id');
    const community = await this.communityRepository.findOne({
      where: { _id: id },
    });
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async update(id: string, updateCommunityDto: UpdateCommunityDto) {
    validateUuid(id, 'community id');
    const community = await this.communityRepository.findOne({
      where: { _id: id },
    });
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    Object.assign(community, updateCommunityDto);
    return await this.communityRepository.save(community);
  }

  async remove(id: string) {
    validateUuid(id, 'community id');
    const community = await this.communityRepository.findOne({
      where: { _id: id },
    });
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    await this.communityRepository.remove(community);

    // Cascade delete memberships, invites, and requests
    // await this.communityMemberRepository.delete({ communityId: id });
    // await this.communityInviteRepository.delete({ communityId: id });
    // await this.communityRequestRepository.delete({ communityId: id });

    return community;
  }

  // ─── Invites & Requests ───

  async invite(communityId: string, inviterId: string, inviteeId: string) {
    validateUuid(communityId, 'community id');
    validateUuid(inviterId, 'inviter user id');
    validateUuid(inviteeId, 'invitee user id');

    // Check if invitee is already a member
    const existingMember = await this.communityMemberRepository.findOne({
      where: { communityId, userId: inviteeId },
    });
    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this community',
      );
    }

    // Check if a pending invite already exists
    const existingInvite = await this.communityInviteRepository.findOne({
      where: {
        communityId,
        inviteeId,
        status: InviteStatus.PENDING,
      },
    });
    if (existingInvite) {
      throw new BadRequestException(
        'An invitation is already pending for this user',
      );
    }

    // Check if a pending request already exists
    const existingRequest = await this.communityRequestRepository.findOne({
      where: {
        communityId,
        userId: inviteeId,
        status: InviteStatus.PENDING,
      },
    });
    if (existingRequest) {
      throw new BadRequestException(
        'This user has already requested to join this community. Please approve their request instead.',
      );
    }

    const invite = this.communityInviteRepository.create({
      communityId,
      inviterId,
      inviteeId,
      status: InviteStatus.PENDING,
    });
    return await this.communityInviteRepository.save(invite);
  }

  async requestToJoin(communityId: string, userId: string) {
    validateUuid(communityId, 'community id');
    validateUuid(userId, 'user id');

    // Check if user is already a member
    const existingMember = await this.communityMemberRepository.findOne({
      where: { communityId, userId },
    });
    if (existingMember) {
      throw new BadRequestException(
        'You are already a member of this community',
      );
    }

    // Check if a pending request already exists
    const existingRequest = await this.communityRequestRepository.findOne({
      where: {
        communityId,
        userId,
        status: InviteStatus.PENDING,
      },
    });
    if (existingRequest) {
      throw new BadRequestException(
        'A join request is already pending for this community',
      );
    }

    // Check if a pending invite already exists
    const existingInvite = await this.communityInviteRepository.findOne({
      where: {
        communityId,
        inviteeId: userId,
        status: InviteStatus.PENDING,
      },
    });
    if (existingInvite) {
      throw new BadRequestException(
        'You have already been invited to join this community. Please accept the invitation instead.',
      );
    }

    const request = this.communityRequestRepository.create({
      communityId,
      userId,
      status: InviteStatus.PENDING,
    });
    return await this.communityRequestRepository.save(request);
  }

  async acceptInvite(inviteId: string, userId: string) {
    validateUuid(inviteId, 'invite id');
    validateUuid(userId, 'user id');

    const invite = await this.communityInviteRepository.findOne({
      where: { _id: inviteId },
    });
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (invite.inviteeId !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Invitation is already ${invite.status}`);
    }

    invite.status = InviteStatus.ACCEPTED;
    await this.communityInviteRepository.save(invite);

    // Create community member
    const existingMember = await this.communityMemberRepository.findOne({
      where: { communityId: invite.communityId, userId },
    });

    if (!existingMember) {
      const member = this.communityMemberRepository.create({
        communityId: invite.communityId,
        userId,
        role: Role.MEMBER,
      });
      await this.communityMemberRepository.save(member);
    }

    return invite;
  }

  async declineInvite(inviteId: string, userId: string) {
    validateUuid(inviteId, 'invite id');

    const invite = await this.communityInviteRepository.findOne({
      where: { _id: inviteId },
    });
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (invite.inviteeId !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Invitation is already ${invite.status}`);
    }

    invite.status = InviteStatus.DECLINED;
    return await this.communityInviteRepository.save(invite);
  }

  async acceptRequest(requestId: string) {
    validateUuid(requestId, 'request id');

    const joinRequest = await this.communityRequestRepository.findOne({
      where: { _id: requestId },
    });
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Request is already ${joinRequest.status}`);
    }

    joinRequest.status = InviteStatus.ACCEPTED;
    await this.communityRequestRepository.save(joinRequest);

    // Create community member
    const existingMember = await this.communityMemberRepository.findOne({
      where: {
        communityId: joinRequest.communityId,
        userId: joinRequest.userId,
      },
    });

    if (!existingMember) {
      const member = this.communityMemberRepository.create({
        communityId: joinRequest.communityId,
        userId: joinRequest.userId,
        role: Role.MEMBER,
      });
      await this.communityMemberRepository.save(member);
    }

    return joinRequest;
  }

  async declineRequest(requestId: string) {
    validateUuid(requestId, 'request id');

    const joinRequest = await this.communityRequestRepository.findOne({
      where: { _id: requestId },
    });
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Request is already ${joinRequest.status}`);
    }

    joinRequest.status = InviteStatus.DECLINED;
    return await this.communityRequestRepository.save(joinRequest);
  }

  // ─── Members ───

  async changeMemberRole(
    communityId: string,
    memberUserId: string,
    newRole: Role,
  ) {
    validateUuid(communityId, 'community id');
    validateUuid(memberUserId, 'member user id');

    const member = await this.communityMemberRepository.findOne({
      where: { communityId, userId: memberUserId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this community');
    }

    if (member.role === Role.ADMIN) {
      throw new BadRequestException(
        'Cannot change the role of the community admin',
      );
    }

    member.role = newRole;
    return await this.communityMemberRepository.save(member);
  }

  async removeMember(
    communityId: string,
    memberUserId: string,
    callerUserId: string,
  ) {
    validateUuid(communityId, 'community id');
    validateUuid(memberUserId, 'member user id');
    validateUuid(callerUserId, 'caller user id');

    const memberToDelete = await this.communityMemberRepository.findOne({
      where: { communityId, userId: memberUserId },
    });

    if (!memberToDelete) {
      throw new NotFoundException('Member not found in this community');
    }

    // Role check hierarchy:
    // Cannot delete the admin
    if (memberToDelete.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot delete the community admin');
    }

    // A moderator cannot delete another moderator
    const callerMember = await this.communityMemberRepository.findOne({
      where: { communityId, userId: callerUserId },
    });

    if (
      callerMember &&
      callerMember.role === Role.MODERATOR &&
      memberToDelete.role === Role.MODERATOR
    ) {
      throw new ForbiddenException('Moderators cannot delete other moderators');
    }

    await this.communityMemberRepository.remove(memberToDelete);

    return { message: 'Member removed successfully' };
  }

  // ─── Query Helpers ───

  async getMembers(communityId: string) {
    validateUuid(communityId, 'community id');
    return await this.communityMemberRepository.find({
      where: { communityId },
    });
  }

  async getRequests(communityId: string) {
    validateUuid(communityId, 'community id');
    return await this.communityRequestRepository.find({
      where: { communityId, status: InviteStatus.PENDING },
    });
  }

  async getMyInvites(userId: string) {
    validateUuid(userId, 'user id');
    const invites = await this.communityInviteRepository.find({
      where: { inviteeId: userId, status: InviteStatus.PENDING },
    });

    const populatedInvites: any[] = [];
    for (const invite of invites) {
      const c = await this.communityRepository.findOne({
        where: { _id: invite.communityId },
      });
      const inviter = await this.userRepository.findOne({
        where: { _id: invite.inviterId },
      });
      populatedInvites.push({
        _id: invite._id,
        communityId: invite.communityId,
        communityName: c ? c.name : 'Unknown Community',
        inviterId: invite.inviterId,
        inviterName: inviter
          ? `${inviter.fname} ${inviter.lname}`.trim()
          : 'Unknown User',
        status: invite.status,
      });
    }
    return populatedInvites;
  }

  async getMyManagedRequests(userId: string) {
    validateUuid(userId, 'user id');
    const memberships = await this.communityMemberRepository.find({
      where: {
        userId,
        role: In([Role.ADMIN, Role.MODERATOR]),
      },
    });

    const communityIds = memberships.map((m) => m.communityId);
    if (communityIds.length === 0) return [];

    const requests = await this.communityRequestRepository.find({
      where: {
        communityId: In(communityIds),
        status: InviteStatus.PENDING,
      },
    });

    const populatedRequests: any[] = [];
    for (const req of requests) {
      const u = await this.userRepository.findOne({
        where: { _id: req.userId },
      });
      const c = await this.communityRepository.findOne({
        where: { _id: req.communityId },
      });
      populatedRequests.push({
        _id: req._id,
        communityId: req.communityId,
        communityName: c ? c.name : 'Unknown Community',
        userId: req.userId,
        userName: u ? `${u.fname} ${u.lname}`.trim() : 'Unknown User',
        userEmail: u ? u.email : '',
        status: req.status,
      });
    }
    return populatedRequests;
  }

  async getMyRole(communityId: string, userId: string) {
    validateUuid(communityId, 'community id');
    validateUuid(userId, 'user id');

    // 1. Check membership
    const member = await this.communityMemberRepository.findOne({
      where: { communityId, userId },
    });
    if (member) {
      return { role: member.role, status: 'member' };
    }

    // 2. Check pending request
    const pendingRequest = await this.communityRequestRepository.findOne({
      where: {
        communityId,
        userId,
        status: InviteStatus.PENDING,
      },
    });
    if (pendingRequest) {
      return { role: null, status: 'requested' };
    }

    // 3. Check pending invite
    const pendingInvite = await this.communityInviteRepository.findOne({
      where: {
        communityId,
        inviteeId: userId,
        status: InviteStatus.PENDING,
      },
    });
    if (pendingInvite) {
      return {
        role: null,
        status: 'invited',
        inviteId: pendingInvite._id,
      };
    }

    return { role: null, status: 'none' };
  }

  async getMyCommunities(userId: string) {
    validateUuid(userId, 'user id');
    const memberships = await this.communityMemberRepository.find({
      where: { userId },
    });
    const communityIds = memberships.map((m) => m.communityId);
    if (communityIds.length === 0) return [];

    return await this.communityRepository.find({
      where: { _id: In(communityIds) },
    });
  }
}
