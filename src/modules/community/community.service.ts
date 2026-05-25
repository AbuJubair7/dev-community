import { Injectable } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Community, CommunityDocument } from './entities/community.entity';
import {
  CommunityMember,
  CommunityMemberDocument,
} from './entities/community-member.entity';
import { Model } from 'mongoose';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<Community>,
    @InjectModel(CommunityMember.name)
    private communityMemberModel: Model<CommunityMember>,
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
  async create(createCommunityDto: CreateCommunityDto) {
    const createdCommunity =
      await this.communityModel.create(createCommunityDto);
    if (!createdCommunity) {
      throw new Error('Failed to create community');
    }
    return this.serializeCommunity(createdCommunity);
  }

  async findAll() {
    const communities = await this.communityModel.find();
    if (communities.length === 0) {
      return [];
    }
    return communities.map((community) => this.serializeCommunity(community));
  }

  async findOne(id: number) {
    const community = await this.communityModel.findById(id);
    if (!community) {
      return null;
    }
    return this.serializeCommunity(community);
  }

  async update(id: number, _updateCommunityDto: UpdateCommunityDto) {
    const community = await this.communityModel.findByIdAndUpdate(
      id,
      _updateCommunityDto,
      { new: true },
    );
    if (!community) {
      throw new Error('Community not found');
    }
    return this.serializeCommunity(community);
  }

  async remove(id: number) {
    const community = await this.communityModel.findByIdAndDelete(id);
    if (!community) {
      throw new Error('Community not found');
    }
    return this.serializeCommunity(community);
  }
}
