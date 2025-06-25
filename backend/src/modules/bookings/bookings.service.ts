import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus, Prisma } from '@prisma/client';

interface BookingQuery {
  status?: BookingStatus;
  after?: string;
  before?: string;
}

interface CreateBookingData extends CreateBookingDto {
  userId: string;
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findUserBookings(userId: string, query: BookingQuery = {}) {
    const where: Prisma.BookingWhereInput = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.after || query.before) {
      const startTimeFilter: Prisma.DateTimeFilter = {};

      if (query.after) {
        startTimeFilter.gte = new Date(query.after);
      }

      if (query.before) {
        startTimeFilter.lte = new Date(query.before);
      }

      where.event = {
        startTime: startTimeFilter,
      };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        event: {
          include: {
            category: true,
            host: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            category: true,
            host: {
              include: { user: true },
            },
          },
        },
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only access your own bookings');
    }

    return booking;
  }

  async create(createBookingData: CreateBookingData) {
    // Check if event exists and has capacity
    const event = await this.prisma.event.findUnique({
      where: { id: createBookingData.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user already has a booking for this event
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        eventId: createBookingData.eventId,
        userId: createBookingData.userId,
      },
    });

    if (existingBooking) {
      throw new ForbiddenException('You already have a booking for this event');
    }

    // Check existing bookings count against capacity
    if (event.capacity !== null) {
      const existingBookings = await this.prisma.booking.count({
        where: {
          eventId: createBookingData.eventId,
          status: { not: BookingStatus.CANCELLED },
        },
      });

      if (existingBookings >= event.capacity) {
        throw new ForbiddenException('Event is full');
      }
    }

    return this.prisma.booking.create({
      data: {
        eventId: createBookingData.eventId,
        userId: createBookingData.userId,
        status: BookingStatus.PENDING,
      },
      include: {
        event: {
          include: {
            category: true,
            host: {
              include: { user: true },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        event: true,
        user: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
