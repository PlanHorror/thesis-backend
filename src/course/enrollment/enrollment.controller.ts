import { Controller, Get } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get('all')
  async getAllEnrollments() {
    return this.enrollmentService.findAll();
  }
}
