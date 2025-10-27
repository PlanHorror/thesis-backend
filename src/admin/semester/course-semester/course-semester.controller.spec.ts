import { Test, TestingModule } from '@nestjs/testing';
import { CourseSemesterController } from './course-semester.controller';

describe('CourseSemesterController', () => {
  let controller: CourseSemesterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseSemesterController],
    }).compile();

    controller = module.get<CourseSemesterController>(CourseSemesterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
