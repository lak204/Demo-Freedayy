import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { validateObjectId } from '../../common/utils/id-validator';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    validateObjectId(userId);
    validateObjectId(createReviewDto.eventId);

    // Check if user already reviewed this event
    const existingReview = await this.prisma.review.findFirst({
      where: {
        eventId: createReviewDto.eventId,
        userId: userId,
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this event');
    }

    // Check if user attended the event
    const booking = await this.prisma.booking.findFirst({
      where: {
        eventId: createReviewDto.eventId,
        userId: userId,
        status: 'ATTENDED',
      },
    });

    if (!booking) {
      throw new ForbiddenException(
        'You can only review events you have attended',
      );
    }

    return this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findByEvent(eventId: string) {
    validateObjectId(eventId);
    return this.prisma.review.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    validateObjectId(userId);
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    validateObjectId(id);
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    validateObjectId(id);
    validateObjectId(userId);

    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    validateObjectId(id);
    validateObjectId(userId);

    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
