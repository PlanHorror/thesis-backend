import { Test, TestingModule } from '@nestjs/testing';
import { ExamScheduleController } from './exam-schedule.controller';

describe('ExamScheduleController', () => {
  let controller: ExamScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamScheduleController],
    }).compile();

    controller = module.get<ExamScheduleController>(ExamScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
