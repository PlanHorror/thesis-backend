import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lecturer, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LecturerUpdateAccountDto } from 'src/admin/dto/lecturer.dto';
@Injectable()
export class LecturerService {
  private logger = new Logger(LecturerService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<Lecturer[]> {
    return this.prisma.lecturer.findMany();
  }

  async findById(id: string): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { id },
      });
      if (!lecturer) {
        throw new NotFoundException('Lecturer not found');
      }
      return lecturer;
    } catch (error) {
      this.logger.error('Failed to retrieve lecturer', error.stack);
      throw new NotFoundException('Lecturer not found');
    }
  }

  async findByEmail(email: string): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { email },
      });
      if (!lecturer) {
        throw new NotFoundException('Lecturer not found');
      }
      return lecturer;
    } catch (error) {
      this.logger.error('Failed to retrieve lecturer', error.stack);
      throw new NotFoundException('Lecturer not found');
    }
  }

  async findByUsername(username: string): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { username },
      });
      if (!lecturer) {
        throw new NotFoundException('Lecturer not found');
      }
      return lecturer;
    } catch (error) {
      this.logger.error('Failed to retrieve lecturer', error.stack);
      throw new NotFoundException('Lecturer not found');
    }
  }

  async create(data: Prisma.LecturerCreateInput): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.create({
        data,
      });

      // Emit event for lecturer created
      this.eventEmitter.emit('lecturer.created', lecturer);

      return lecturer;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          if (Array.isArray(error.meta?.target)) {
            console.warn(
              'Unique constraint failed on the fields: ',
              error.meta.target,
            );
            throw new ConflictException(
              `${error.meta.target.join(', ')} already exists`,
            );
          }
        }
      }
      this.logger.error('Failed to create ', error.stack);
      throw new BadRequestException('Failed to create ');
    }
  }

  async createMultipleLecturers(
    data: Prisma.LecturerCreateManyInput[],
  ): Promise<{ message: string }> {
    await this.prisma.lecturer.createMany({
      data,
      skipDuplicates: true,
    });
    return { message: 'Lecturers created successfully' };
  }

  async update(
    id: string,
    data: Prisma.LecturerUpdateInput,
  ): Promise<Lecturer> {
    try {
      return await this.prisma.lecturer.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Lecturer with ID ${id} not found`);
          throw new NotFoundException('Lecturer not found');
        }
        if (error.code === 'P2002') {
          if (Array.isArray(error.meta?.target)) {
            console.warn(
              'Unique constraint failed on the fields: ',
              error.meta.target,
            );
            throw new ConflictException(
              `${error.meta.target.join(', ')} already exists`,
            );
          }
        }
      }
      this.logger.error('Failed to update ', error.stack);
      throw new BadRequestException('Failed to update ');
    }
  }

  async delete(id: string): Promise<Lecturer> {
    try {
      return await this.prisma.lecturer.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Lecturer with ID ${id} not found`);
          throw new NotFoundException('Lecturer not found');
        }
      }
      this.logger.error('Failed to delete lecturer', error.stack);
      throw new BadRequestException('Failed to delete lecturer');
    }
  }

  async deleteMany(ids: string[]): Promise<{ message: string }> {
    try {
      await this.prisma.lecturer.deleteMany({
        where: { id: { in: ids } },
      });
      return { message: 'Lecturers deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('One or more lecturers not found');
        }
      }
      this.logger.error('Failed to delete lecturers', error.stack);
      throw new BadRequestException('Failed to delete lecturers');
    }
  }

  async lecturerUpdateAccount(
    data: LecturerUpdateAccountDto,
    lecturer: Lecturer,
  ) {
    try {
      const { password, oldPassword, ...updateData } = data;
      let hashedPassword: string | null = null;
      if (password) {
        if (
          !oldPassword ||
          bcrypt.compareSync(oldPassword, lecturer.password) === false
        ) {
          throw new BadRequestException('Old password is incorrect');
        }
        const salt = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(password, salt);
      }
      const updatedLecturer = await this.prisma.lecturer.update({
        where: { id: lecturer.id },
        data: {
          ...updateData,
          ...(hashedPassword && { password: hashedPassword }),
        },
      });

      // Emit event for password changed if password was updated
      if (hashedPassword) {
        this.eventEmitter.emit('lecturer.password_changed', updatedLecturer);
      }

      return updatedLecturer;
    } catch (error) {
      this.logger.error('Failed to update lecturer account', error.stack);
      throw new BadRequestException('Failed to update lecturer account');
    }
  }
}
