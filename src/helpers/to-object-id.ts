import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Converts a string ID to a Mongoose ObjectId.
 */
export function toObjectId(id: string, fieldName: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid ${fieldName}`);
  }
  return new Types.ObjectId(id);
}
