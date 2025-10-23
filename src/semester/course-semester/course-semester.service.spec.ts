import { Test, TestingModule } from '@nestjs/testing';
import { CourseSemesterService } from './course-semester.service';

describe('CourseSemesterService', () => {
  let service: CourseSemesterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseSemesterService],
    }).compile();

    service = module.get<CourseSemesterService>(CourseSemesterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
