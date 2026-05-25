import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../../decorators/role.decorator';
import { Role } from './enums/role.enum';

@UseGuards(JwtGuard, RoleGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  create(@Body() createCommunityDto: CreateCommunityDto, @Req() req: any) {
    return this.communityService.create(createCommunityDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.communityService.findAll();
  }

  @Get('member/my')
  getMyCommunities(@Req() req: any) {
    return this.communityService.getMyCommunities(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return this.communityService.update(id, updateCommunityDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityService.remove(id);
  }

  // ─── Invites & Requests ───

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post(':id/invite')
  invite(
    @Param('id') communityId: string,
    @Body('inviteeId') inviteeId: string,
    @Req() req: any,
  ) {
    return this.communityService.invite(communityId, req.user.id, inviteeId);
  }

  @Post(':id/request')
  requestToJoin(@Param('id') communityId: string, @Req() req: any) {
    return this.communityService.requestToJoin(communityId, req.user.id);
  }

  @Post('invite/:inviteId/accept')
  acceptInvite(@Param('inviteId') inviteId: string, @Req() req: any) {
    return this.communityService.acceptInvite(inviteId, req.user.id);
  }

  @Post('invite/:inviteId/decline')
  declineInvite(@Param('inviteId') inviteId: string, @Req() req: any) {
    return this.communityService.declineInvite(inviteId, req.user.id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post(':id/request/:requestId/accept')
  acceptRequest(
    @Param('id') communityId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.communityService.acceptRequest(requestId);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post(':id/request/:requestId/decline')
  declineRequest(
    @Param('id') communityId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.communityService.declineRequest(requestId);
  }

  // ─── Members ───

  @Roles(Role.ADMIN)
  @Patch(':id/member/:userId/role')
  changeRole(
    @Param('id') communityId: string,
    @Param('userId') userId: string,
    @Body('role') role: Role,
  ) {
    return this.communityService.changeMemberRole(communityId, userId, role);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Delete(':id/member/:userId')
  removeMember(
    @Param('id') communityId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.communityService.removeMember(communityId, userId, req.user.id);
  }

  // ─── Queries ───

  @Get('invites/my')
  getMyInvites(@Req() req: any) {
    return this.communityService.getMyInvites(req.user.id);
  }

  @Get(':id/members')
  getMembers(@Param('id') communityId: string) {
    return this.communityService.getMembers(communityId);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get(':id/requests')
  getRequests(@Param('id') communityId: string) {
    return this.communityService.getRequests(communityId);
  }

  @Get(':id/my-role')
  getMyRole(@Param('id') communityId: string, @Req() req: any) {
    return this.communityService.getMyRole(communityId, req.user.id);
  }
}
