import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query() filterDto: EventFilterDto) {
    return this.eventsService.findAll(filterDto);
  }

  @Get('featured')
  async findFeatured() {
    return this.eventsService.findFeatured();
  }

  @Get('upcoming')
  async findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  @Get('trending')
  async findTrending() {
    return this.eventsService.findTrending();
  }

  @Get('recommended/:userId')
  async findRecommended(@Param('userId') userId: string) {
    return this.eventsService.findRecommended(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Get(':id/attendees')
  @UseGuards(JwtAuthGuard)
  async getAttendees(@Param('id') eventId: string) {
    return this.eventsService.getAttendees(eventId);
  }

  @Post(':id/bookings')
  @UseGuards(JwtAuthGuard)
  async createBooking(@Param('id') eventId: string, @Body() bookingData: any) {
    return this.eventsService.createBooking(eventId, bookingData.userId);
  }

  @Get(':id/bookings')
  @UseGuards(JwtAuthGuard)
  async getEventBookings(@Param('id') eventId: string) {
    return this.eventsService.getEventBookings(eventId);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async createReview(@Param('id') eventId: string, @Body() reviewData: any) {
    return this.eventsService.createReview(eventId, reviewData);
  }

  @Get(':id/reviews')
  async getEventReviews(@Param('id') eventId: string) {
    return this.eventsService.getEventReviews(eventId);
  }
}
