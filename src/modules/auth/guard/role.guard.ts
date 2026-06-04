import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityMemberEntity } from 'src/modules/community/pg-entities/community-member.entity';
import { validateUuid } from 'src/helpers/validate-uuid';
import { Request } from 'express';
import { Role } from 'src/modules/community/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(CommunityMemberEntity)
    private communityMemberRepository: Repository<CommunityMemberEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role required, allow access
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;
    if (!user || !user.id) {
      throw new UnauthorizedException('Not authenticated');
    }

    const userId = user.id;

    // Retrieve communityId from request params, body, or query
    const communityId =
      request.params.communityId ||
      request.params.id ||
      request.body.communityId ||
      request.query.communityId;

    if (!communityId) {
      throw new ForbiddenException('Community context not found in request');
    }

    try {
      const member = await this.communityMemberRepository.findOne({
        where: {
          communityId: validateUuid(communityId, 'community id'),
          userId: validateUuid(userId, 'user id'),
        },
      });

      if (!member) {
        throw new ForbiddenException('You are not a member of this community');
      }

      const hasRole = requiredRoles.includes(member.role);
      if (!hasRole) {
        throw new ForbiddenException(
          `Requires one of the following roles: ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Failed to verify community roles');
    }
  }
}
