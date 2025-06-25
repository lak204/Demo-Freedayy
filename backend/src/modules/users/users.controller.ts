import {
  Controller,
  Get,
  Patch,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces';
import { UpdatePreferenceDto } from '../preferences/dto/update-preference.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  async updateMe(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get('me/preferences')
  async getMyPreferences(@Request() req: AuthenticatedRequest) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Put('me/preferences')
  async updateMyPreferences(
    @Request() req: AuthenticatedRequest,
    @Body() updatePreferenceDto: UpdatePreferenceDto,
  ) {
    return this.usersService.updateUserPreferences(
      req.user.id,
      updatePreferenceDto,
    );
  }
}
