import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Converts a string ID to a Mongoose ObjectId.
 * Throws a BadRequestException if the string is not a valid ObjectId.
 *
 * @param id - The string ID to convert.
 * @param fieldName - A human-readable label used in the error message (e.g. 'user id').
 * @returns A valid Mongoose `Types.ObjectId`.
 */
export function toObjectId(id: string, fieldName: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid ${fieldName}`);
  }
  return new Types.ObjectId(id);
}
