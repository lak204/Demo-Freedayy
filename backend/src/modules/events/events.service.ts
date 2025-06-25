import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import {
  EventWhereCondition,
  LocationUpdate,
  ReviewData,
} from '../../common/interfaces';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filterDto: EventFilterDto) {
    // Type assertion to ensure proper typing recognition
    const dto = filterDto as EventFilterDto;

    const category: string | undefined = dto.category;
    const minPrice: number | undefined = dto.minPrice;
    const maxPrice: number | undefined = dto.maxPrice;
    const startDate: string | undefined = dto.startDate;
    const endDate: string | undefined = dto.endDate;
    const city: string | undefined = dto.city;
    const tags: string[] | undefined = dto.tags;
    const page: number = dto.page || 1;
    const limit: number = dto.limit || 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    if (city) {
      where.location = {
        city: {
          contains: city,
          mode: 'insensitive',
        },
      };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
        bookings: true,
        reviews: true,
      },
      orderBy: {
        startTime: 'asc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return events;
  }

  async findFeatured() {
    return this.prisma.event.findMany({
      where: {
        featured: true,
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
        bookings: true,
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 10,
    });
  }

  async findUpcoming() {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return this.prisma.event.findMany({
      where: {
        startTime: {
          gte: now,
          lte: next48Hours,
        },
      },
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
        bookings: true,
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 10,
    });
  }

  async findTrending() {
    return this.prisma.event.findMany({
      where: {
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
        bookings: true,
        reviews: true,
      },
      orderBy: [
        {
          bookings: {
            _count: 'desc',
          },
        },
        {
          reviews: {
            _count: 'desc',
          },
        },
      ],
      take: 10,
    });
  }

  async findRecommended(userId: string) {
    // Validate ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(userId)) {
      throw new NotFoundException('Invalid user ID format');
    }

    // Get user preferences
    const userPreferences = await this.prisma.preference.findUnique({
      where: { userId },
    });

    const where: any = {
      startTime: {
        gte: new Date(),
      },
    };

    if (userPreferences) {
      if (userPreferences.favoredTags.length > 0) {
        where.tags = {
          hasSome: userPreferences.favoredTags,
        };
      }

      if (userPreferences.maxBudget) {
        where.price = {
          lte: userPreferences.maxBudget,
        };
      }
    }

    return this.prisma.event.findMany({
      where,
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
        bookings: true,
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 10,
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
        bookings: {
          include: {
            user: true,
          },
        },
        reviews: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: createEventDto,
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Transform the DTO to match Prisma's expected structure
    const { location, ...otherFields } = updateEventDto;
    const updateData: any = { ...otherFields };

    // Handle location update separately if provided
    if (location) {
      updateData.location = {
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        city: location.city,
      };
    }

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        host: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async getAttendees(eventId: string) {
    return this.prisma.booking.findMany({
      where: {
        eventId,
        status: 'CONFIRMED',
      },
      include: {
        user: true,
        event: true,
      },
    });
  }

  async createBooking(eventId: string, userId: string) {
    // Check if event exists and has capacity
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { bookings: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.capacity && event.bookings.length >= event.capacity) {
      throw new Error('Event is full');
    }

    return this.prisma.booking.create({
      data: {
        eventId,
        userId,
        status: 'CONFIRMED',
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async getEventBookings(eventId: string) {
    return this.prisma.booking.findMany({
      where: { eventId },
      include: {
        user: true,
        event: true,
      },
    });
  }

  async createReview(eventId: string, reviewData: any) {
    return this.prisma.review.create({
      data: {
        eventId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
      include: {
        user: true,
        event: true,
      },
    });
  }

  async getEventReviews(eventId: string) {
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
}
