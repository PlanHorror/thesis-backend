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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SessionService } from './session.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Enrollment Sessions')
@ApiBearerAuth('accessToken')
@Controller('enrollment/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // Public endpoints for students and lecturers - Active sessions only
  @Get('all')
  @UseGuards(AuthGuard('accessToken'))
  @ApiOperation({ summary: 'Get all active enrollment sessions' })
  @ApiResponse({
    status: 200,
    description: 'List of all active sessions returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllActiveSessions() {
    return this.sessionService.findAllActive(true);
  }

  @Get(':id')
  @UseGuards(AuthGuard('accessToken'))
  @ApiOperation({ summary: 'Get active session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getActiveSessionById(@Param('id') id: string) {
    return this.sessionService.findByIdActive(id, true);
  }

  @Get('semester/:semesterId')
  @UseGuards(AuthGuard('accessToken'))
  @ApiOperation({ summary: 'Get active sessions by semester ID' })
  @ApiParam({ name: 'semesterId', description: 'Semester ID' })
  @ApiResponse({
    status: 200,
    description: 'Sessions for semester returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async getActiveSessionsBySemesterId(@Param('semesterId') semesterId: string) {
    return this.sessionService.findBySemesterIdActive(semesterId, true);
  }
}
