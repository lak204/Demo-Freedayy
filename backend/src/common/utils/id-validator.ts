import { BadRequestException } from '@nestjs/common';

export function validateObjectId(id: string): void {
  // MongoDB ObjectId is a 24-character hex string
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(id)) {
    throw new BadRequestException(`Invalid ObjectID format: ${id}`);
  }
}
