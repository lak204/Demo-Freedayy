import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserRequest, PreferenceRequest } from '../../common/interfaces';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        hostProfile: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        hostProfile: true,
        preferences: true,
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
  }) {
    return this.prisma.user.create({
      data,
      include: {
        hostProfile: true,
        preferences: true,
      },
    });
  }

  async update(id: string, data: UpdateUserRequest) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        hostProfile: true,
        preferences: true,
      },
    });
  }

  async getUserPreferences(userId: string) {
    return this.prisma.preference.findUnique({
      where: { userId },
    });
  }

  async updateUserPreferences(userId: string, data: PreferenceRequest) {
    return this.prisma.preference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}
