import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Community, CommunityDocument } from './entities/community.entity';
import {
  CommunityMember,
  CommunityMemberDocument,
} from './entities/community-member.entity';
import { CommunityInvite } from './entities/community-invite.entity';
import { CommunityRequest } from './entities/community-request.entity';
import { Model, Connection } from 'mongoose';
import { toObjectId } from '../../helpers/to-object-id';
import { Role } from './enums/role.enum';
import { InviteStatus } from './enums/invite-status.enum';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<Community>,
    @InjectModel(CommunityMember.name)
    private communityMemberModel: Model<CommunityMember>,
    @InjectModel(CommunityInvite.name)
    private communityInviteModel: Model<CommunityInvite>,
    @InjectModel(CommunityRequest.name)
    private communityRequestModel: Model<CommunityRequest>,
    @InjectConnection() private connection: Connection,
  ) {}

  private serializeCommunity(community: CommunityDocument) {
    const serializedCommunity = community.toObject();
    return {
      ...serializedCommunity,
      _id: community._id.toString(),
    };
  }

  private serializeCommunityMember(communityMember: CommunityMemberDocument) {
    const serializedCommunityMember = communityMember.toObject();
    return {
      ...serializedCommunityMember,
      _id: communityMember._id.toString(),
    };
  }

  async create(createCommunityDto: CreateCommunityDto, creatorId: string) {
    const createdCommunity =
      await this.communityModel.create(createCommunityDto);
    if (!createdCommunity) {
      throw new BadRequestException('Failed to create community');
    }

    // Automatically set the creator as Admin
    await this.communityMemberModel.create({
      communityId: createdCommunity._id,
      userId: toObjectId(creatorId, 'creator user id'),
      role: Role.ADMIN,
    });

    return this.serializeCommunity(createdCommunity);
  }

  async findAll() {
    const communities = await this.communityModel.find();
    return communities.map((community) => this.serializeCommunity(community));
  }

  async findOne(id: string) {
    const communityObjectId = toObjectId(id, 'community id');
    const community = await this.communityModel.findById(communityObjectId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.serializeCommunity(community);
  }

  async update(id: string, updateCommunityDto: UpdateCommunityDto) {
    const communityObjectId = toObjectId(id, 'community id');
    const community = await this.communityModel.findByIdAndUpdate(
      communityObjectId,
      updateCommunityDto,
      { new: true },
    );
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.serializeCommunity(community);
  }

  async remove(id: string) {
    const communityObjectId = toObjectId(id, 'community id');
    const community =
      await this.communityModel.findByIdAndDelete(communityObjectId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Cascade delete memberships, invites, and requests
    // await this.communityMemberModel
    //   .deleteMany({ communityId: communityObjectId })
    //   .exec();
    // await this.communityInviteModel.deleteMany({ communityId: id }).exec();
    // await this.communityRequestModel
    //   .deleteMany({ communityId: communityObjectId })
    //   .exec();

    return this.serializeCommunity(community);
  }

  // ─── Invites & Requests ───

  async invite(communityId: string, inviterId: string, inviteeId: string) {
    const communityObjectId = toObjectId(communityId, 'community id');
    const inviteeObjectId = toObjectId(inviteeId, 'invitee user id');
    const inviterObjectId = toObjectId(inviterId, 'inviter user id');

    // Check if invitee is already a member
    const existingMember = await this.communityMemberModel
      .findOne({ communityId: communityObjectId, userId: inviteeObjectId })
      .exec();
    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this community',
      );
    }

    // Check if a pending invite already exists
    const existingInvite = await this.communityInviteModel
      .findOne({
        communityId,
        inviteeId: inviteeObjectId,
        status: InviteStatus.PENDING,
      })
      .exec();
    if (existingInvite) {
      throw new BadRequestException(
        'An invitation is already pending for this user',
      );
    }

    // Check if a pending request already exists
    const existingRequest = await this.communityRequestModel
      .findOne({
        communityId: communityObjectId,
        userId: inviteeObjectId,
        status: InviteStatus.PENDING,
      })
      .exec();
    if (existingRequest) {
      throw new BadRequestException(
        'This user has already requested to join this community. Please approve their request instead.',
      );
    }

    return this.communityInviteModel.create({
      communityId,
      inviterId: inviterObjectId,
      inviteeId: inviteeObjectId,
      status: InviteStatus.PENDING,
    });
  }

  async requestToJoin(communityId: string, userId: string) {
    const communityObjectId = toObjectId(communityId, 'community id');
    const userObjectId = toObjectId(userId, 'user id');

    // Check if user is already a member
    const existingMember = await this.communityMemberModel
      .findOne({ communityId: communityObjectId, userId: userObjectId })
      .exec();
    if (existingMember) {
      throw new BadRequestException(
        'You are already a member of this community',
      );
    }

    // Check if a pending request already exists
    const existingRequest = await this.communityRequestModel
      .findOne({
        communityId: communityObjectId,
        userId: userObjectId,
        status: InviteStatus.PENDING,
      })
      .exec();
    if (existingRequest) {
      throw new BadRequestException(
        'A join request is already pending for this community',
      );
    }

    // Check if a pending invite already exists
    const existingInvite = await this.communityInviteModel
      .findOne({
        communityId: communityId,
        inviteeId: userObjectId,
        status: InviteStatus.PENDING,
      })
      .exec();
    if (existingInvite) {
      throw new BadRequestException(
        'You have already been invited to join this community. Please accept the invitation instead.',
      );
    }

    return this.communityRequestModel.create({
      communityId: communityObjectId,
      userId: userObjectId,
      status: InviteStatus.PENDING,
    });
  }

  async acceptInvite(inviteId: string, userId: string) {
    const inviteObjectId = toObjectId(inviteId, 'invite id');
    const userObjectId = toObjectId(userId, 'user id');

    const invite = await this.communityInviteModel
      .findById(inviteObjectId)
      .exec();
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (invite.inviteeId.toString() !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Invitation is already ${invite.status}`);
    }

    invite.status = InviteStatus.ACCEPTED;
    await invite.save();

    // Create community member
    const communityObjectId = toObjectId(invite.communityId, 'community id');
    const existingMember = await this.communityMemberModel
      .findOne({ communityId: communityObjectId, userId: userObjectId })
      .exec();

    if (!existingMember) {
      await this.communityMemberModel.create({
        communityId: communityObjectId,
        userId: userObjectId,
        role: Role.MEMBER,
      });
    }

    return invite;
  }

  async declineInvite(inviteId: string, userId: string) {
    const inviteObjectId = toObjectId(inviteId, 'invite id');

    const invite = await this.communityInviteModel
      .findById(inviteObjectId)
      .exec();
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (invite.inviteeId.toString() !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Invitation is already ${invite.status}`);
    }

    invite.status = InviteStatus.DECLINED;
    await invite.save();

    return invite;
  }

  async acceptRequest(requestId: string) {
    const requestObjectId = toObjectId(requestId, 'request id');

    const joinRequest = await this.communityRequestModel
      .findById(requestObjectId)
      .exec();
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Request is already ${joinRequest.status}`);
    }

    joinRequest.status = InviteStatus.ACCEPTED;
    await joinRequest.save();

    // Create community member
    const existingMember = await this.communityMemberModel
      .findOne({
        communityId: joinRequest.communityId,
        userId: joinRequest.userId,
      })
      .exec();

    if (!existingMember) {
      await this.communityMemberModel.create({
        communityId: joinRequest.communityId,
        userId: joinRequest.userId,
        role: Role.MEMBER,
      });
    }

    return joinRequest;
  }

  async declineRequest(requestId: string) {
    const requestObjectId = toObjectId(requestId, 'request id');

    const joinRequest = await this.communityRequestModel
      .findById(requestObjectId)
      .exec();
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Request is already ${joinRequest.status}`);
    }

    joinRequest.status = InviteStatus.DECLINED;
    await joinRequest.save();

    return joinRequest;
  }

  // ─── Members ───

  async changeMemberRole(
    communityId: string,
    memberUserId: string,
    newRole: Role,
  ) {
    const communityObjectId = toObjectId(communityId, 'community id');
    const memberUserObjectId = toObjectId(memberUserId, 'member user id');

    const member = await this.communityMemberModel
      .findOne({ communityId: communityObjectId, userId: memberUserObjectId })
      .exec();

    if (!member) {
      throw new NotFoundException('Member not found in this community');
    }

    if (member.role === Role.ADMIN) {
      throw new BadRequestException(
        'Cannot change the role of the community admin',
      );
    }

    member.role = newRole;
    await member.save();

    return this.serializeCommunityMember(member);
  }

  async removeMember(
    communityId: string,
    memberUserId: string,
    callerUserId: string,
  ) {
    const communityObjectId = toObjectId(communityId, 'community id');
    const memberUserObjectId = toObjectId(memberUserId, 'member user id');
    const callerUserObjectId = toObjectId(callerUserId, 'caller user id');

    const memberToDelete = await this.communityMemberModel
      .findOne({ communityId: communityObjectId, userId: memberUserObjectId })
      .exec();

    if (!memberToDelete) {
      throw new NotFoundException('Member not found in this community');
    }

    // Role check hierarchy:
    // Cannot delete the admin
    if (memberToDelete.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot delete the community admin');
    }

    // A moderator cannot delete another moderator
    const callerMember = await this.communityMemberModel
      .findOne({ communityId: communityObjectId, userId: callerUserObjectId })
      .exec();

    if (
      callerMember &&
      callerMember.role === Role.MODERATOR &&
      memberToDelete.role === Role.MODERATOR
    ) {
      throw new ForbiddenException('Moderators cannot delete other moderators');
    }

    await this.communityMemberModel
      .deleteOne({ _id: memberToDelete._id })
      .exec();

    return { message: 'Member removed successfully' };
  }

  // ─── Query Helpers ───

  async getMembers(communityId: string) {
    const communityObjectId = toObjectId(communityId, 'community id');
    const members = await this.communityMemberModel
      .find({ communityId: communityObjectId })
      .exec();
    return members.map((m) => this.serializeCommunityMember(m));
  }

  async getRequests(communityId: string) {
    const communityObjectId = toObjectId(communityId, 'community id');
    return this.communityRequestModel
      .find({ communityId: communityObjectId, status: InviteStatus.PENDING })
      .exec();
  }

  async getMyInvites(userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const invites = await this.communityInviteModel
      .find({ inviteeId: userObjectId, status: InviteStatus.PENDING })
      .exec();

    const populatedInvites: any[] = [];
    for (const invite of invites) {
      const c = await this.communityModel.findById(invite.communityId).exec();
      const inviter = await this.connection.model('User').findById(invite.inviterId).exec();
      populatedInvites.push({
        _id: invite._id.toString(),
        communityId: invite.communityId.toString(),
        communityName: c ? c.name : 'Unknown Community',
        inviterId: invite.inviterId.toString(),
        inviterName: inviter ? `${inviter.fname} ${inviter.lname}`.trim() : 'Unknown User',
        status: invite.status,
      });
    }
    return populatedInvites;
  }

  async getMyManagedRequests(userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const memberships = await this.communityMemberModel
      .find({
        userId: userObjectId,
        role: { $in: [Role.ADMIN, Role.MODERATOR] },
      })
      .exec();

    const communityIds = memberships.map((m) => m.communityId);
    const requests = await this.communityRequestModel
      .find({
        communityId: { $in: communityIds },
        status: InviteStatus.PENDING,
      })
      .exec();

    const populatedRequests: any[] = [];
    for (const req of requests) {
      const u = await this.connection.model('User').findById(req.userId).exec();
      const c = await this.communityModel.findById(req.communityId).exec();
      populatedRequests.push({
        _id: req._id.toString(),
        communityId: req.communityId.toString(),
        communityName: c ? c.name : 'Unknown Community',
        userId: req.userId.toString(),
        userName: u ? `${u.fname} ${u.lname}`.trim() : 'Unknown User',
        userEmail: u ? u.email : '',
        status: req.status,
      });
    }
    return populatedRequests;
  }

  async getMyRole(communityId: string, userId: string) {
    const communityObjectId = toObjectId(communityId, 'community id');
    const userObjectId = toObjectId(userId, 'user id');

    // 1. Check membership
    const member = await this.communityMemberModel
      .findOne({ communityId: communityObjectId, userId: userObjectId })
      .exec();
    if (member) {
      return { role: member.role, status: 'member' };
    }

    // 2. Check pending request
    const pendingRequest = await this.communityRequestModel
      .findOne({
        communityId: communityObjectId,
        userId: userObjectId,
        status: InviteStatus.PENDING,
      })
      .exec();
    if (pendingRequest) {
      return { role: null, status: 'requested' };
    }

    // 3. Check pending invite
    const pendingInvite = await this.communityInviteModel
      .findOne({
        communityId,
        inviteeId: userObjectId,
        status: InviteStatus.PENDING,
      })
      .exec();
    if (pendingInvite) {
      return {
        role: null,
        status: 'invited',
        inviteId: pendingInvite._id.toString(),
      };
    }

    return { role: null, status: 'none' };
  }

  async getMyCommunities(userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const memberships = await this.communityMemberModel
      .find({ userId: userObjectId })
      .exec();
    const communityIds = memberships.map((m) => m.communityId);
    const communities = await this.communityModel
      .find({ _id: { $in: communityIds } })
      .exec();
    return communities.map((c) => this.serializeCommunity(c));
  }
}
