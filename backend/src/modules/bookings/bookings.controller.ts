import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest, BookingQuery } from '../../common/interfaces';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: BookingQuery,
  ) {
    return this.bookingsService.findUserBookings(req.user.id, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.findOne(id, req.user.id);
  }

  @Post()
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.create({
      ...createBookingDto,
      userId: req.user.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.update(id, updateBookingDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.remove(id, req.user.id);
  }
}
