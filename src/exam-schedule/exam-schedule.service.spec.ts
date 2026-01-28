import { Test, TestingModule } from '@nestjs/testing';
import { ExamScheduleService } from './exam-schedule.service';

describe('ExamScheduleService', () => {
  let service: ExamScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamScheduleService],
    }).compile();

    service = module.get<ExamScheduleService>(ExamScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
