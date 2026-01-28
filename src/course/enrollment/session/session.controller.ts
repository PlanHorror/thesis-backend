import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('enrollment/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // Public endpoints for students and lecturers - Active sessions only
  @Get('all')
  @UseGuards(AuthGuard('accessToken'))
  async getAllActiveSessions() {
    return this.sessionService.findAllActive(true);
  }

  @Get(':id')
  @UseGuards(AuthGuard('accessToken'))
  async getActiveSessionById(@Param('id') id: string) {
    return this.sessionService.findByIdActive(id, true);
  }

  @Get('semester/:semesterId')
  @UseGuards(AuthGuard('accessToken'))
  async getActiveSessionsBySemesterId(@Param('semesterId') semesterId: string) {
    return this.sessionService.findBySemesterIdActive(semesterId, true);
  }
}
