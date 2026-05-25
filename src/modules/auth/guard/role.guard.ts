import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Role } from 'src/modules/community/enums/role.enum';
import { toObjectId } from 'src/helpers/to-object-id';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectConnection() private connection: Connection,
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
      const communityMemberModel = this.connection.model('CommunityMember');
      const member = await communityMemberModel
        .findOne({
          communityId: toObjectId(communityId, 'community id'),
          userId: toObjectId(userId, 'user id'),
        })
        .exec();

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
