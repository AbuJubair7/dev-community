import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.['id'];
    const paramId = request.params.id;

    if (userId !== paramId) {
      throw new ForbiddenException('You can only access your own resource');
    }

    return true;
  }
}
