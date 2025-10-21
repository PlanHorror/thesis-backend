import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseDocument, Prisma } from '@prisma/client';
import { DocumentCreate, generateFileName, saveFile } from 'common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CourseDocument[]> {
    return await this.prisma.courseDocument.findMany();
  }

  async findById(id: string): Promise<CourseDocument> {
    try {
      const document = await this.prisma.courseDocument.findUnique({
        where: { id },
      });
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      return document;
    } catch (error) {
      this.logger.error('Failed to retrieve document', error.stack);
      throw new NotFoundException('Document not found');
    }
  }

  async findByCourseId(courseId: string): Promise<CourseDocument[]> {
    return await this.prisma.courseDocument.findMany({
      where: { courseId },
    });
  }

  async create(
    data: Omit<Prisma.CourseDocumentCreateInput, 'path'>,
    file: Express.Multer.File,
  ) {
    const path = `attachments/${generateFileName(file)}`;
    await saveFile(file, path);
    try {
      return await this.prisma.courseDocument.create({
        data: {
          ...data,
          path,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create document', error.stack);
      throw new BadRequestException('Failed to create document');
    }
  }

  async createMany(datas: DocumentCreate[]): Promise<{
    message: string;
  }> {
    const documentsData: Prisma.CourseDocumentCreateManyInput[] = [];
    for (const data of datas) {
      const { file, ...rest } = data;
      const path = `attachments/${generateFileName(file)}`;
      await saveFile(file, path);
      documentsData.push({
        ...rest,
        path,
      });
    }
    try {
      await this.prisma.courseDocument.createMany({ data: documentsData });
    } catch (error) {
      this.logger.error('Failed to create documents', error.stack);
      throw new BadRequestException('Failed to create documents');
    }
    return { message: 'Documents created successfully' };
  }

  async delete(id: string) {
    try {
      return await this.prisma.courseDocument.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to delete document', error.stack);
      throw new BadRequestException('Failed to delete document');
    }
  }

  async deleteMany(ids: string[]): Promise<{ message: string }> {
    try {
      await this.prisma.courseDocument.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      this.logger.error('Failed to delete documents', error.stack);
      throw new BadRequestException('Failed to delete documents');
    }
    return { message: 'Documents deleted successfully' };
  }

  async deleteByCourseId(courseId: string): Promise<{ message: string }> {
    try {
      await this.prisma.courseDocument.deleteMany({
        where: { courseId },
      });
    } catch (error) {
      this.logger.error('Failed to delete documents by course ID', error.stack);
      throw new BadRequestException('Failed to delete documents');
    }
    return { message: 'Documents deleted successfully' };
  }
}
