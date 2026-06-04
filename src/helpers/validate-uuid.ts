import { BadRequestException } from '@nestjs/common';

export function validateUuid(id: string, fieldName: string): string {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new BadRequestException(`Invalid ${fieldName}`);
  }
  return id;
}
