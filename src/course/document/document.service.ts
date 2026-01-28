import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseDocument, Prisma } from '@prisma/client';
import {
  DocumentCreate,
  DocumentUpdate,
  generateFileName,
  saveFile,
  deleteFile,
} from 'common';
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

  async findByCourseOnSemesterId(
    courseOnSemesterId: string,
  ): Promise<CourseDocument[]> {
    try {
      return await this.prisma.courseDocument.findMany({
        where: { courseOnSemesterId },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve documents', error.stack);
      throw new NotFoundException('Documents not found');
    }
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
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `CourseOnSemester with ID ${data.courseOnSemester?.connect?.id} not found`,
        );
      }
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
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `One or more courses not found for the provided documents`,
        );
      }
      this.logger.error('Failed to create documents', error.stack);
      throw new BadRequestException('Failed to create documents');
    }
    return { message: 'Documents created successfully' };
  }

  async update(data: DocumentUpdate): Promise<CourseDocument> {
    try {
      const { id, file, ...rest } = data;
      const path = file ? `attachments/${generateFileName(file)}` : undefined;
      if (file) {
        await saveFile(file, path as string);
      }
      return await this.prisma.courseDocument.update({
        where: { id },
        data: { ...rest, ...(path && { path }) },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Document with ID ${data.id} not found`);
      }
      this.logger.error('Failed to update document', error.stack);
      throw new BadRequestException('Failed to update document');
    }
  }

  async updateMany(data: DocumentUpdate[]): Promise<{ message: string }> {
    try {
      const listSaveFile: Promise<void>[] = [];
      const updatePromises = data.map((doc) => {
        const { id, file, ...updateData } = doc;
        let path: string | undefined;
        if (file) {
          path = `attachments/${generateFileName(file)}`;
          listSaveFile.push(saveFile(file, path));
        }
        return this.prisma.courseDocument.update({
          where: { id },
          data: { ...updateData, ...(path && { path }) },
        });
      });
      await Promise.all(listSaveFile);
      await this.prisma.$transaction(updatePromises);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Many documents not found`);
      }
      this.logger.error('Failed to update documents', error.stack);
      throw new BadRequestException('Failed to update documents');
    }
    return { message: 'Documents updated successfully' };
  }

  async delete(id: string) {
    try {
      return await this.prisma.courseDocument.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
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
      if (error.code === 'P2025') {
        throw new NotFoundException('One or more documents not found');
      }
      this.logger.error('Failed to delete documents', error.stack);
      throw new BadRequestException('Failed to delete documents');
    }
    return { message: 'Documents deleted successfully' };
  }

  async deleteByCourseOnSemesterId(
    courseOnSemesterId: string,
  ): Promise<{ message: string }> {
    try {
      await this.prisma.courseDocument.deleteMany({
        where: { courseOnSemesterId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `No documents found for courseOnSemester ID ${courseOnSemesterId}`,
        );
      }
      this.logger.error('Failed to delete documents by course ID', error.stack);
      throw new BadRequestException('Failed to delete documents');
    }
    return { message: 'Documents deleted successfully' };
  }

  async createForLecturer(
    title: string,
    courseOnSemesterId: string,
    lecturerId: string,
    file: Express.Multer.File,
  ): Promise<CourseDocument> {
    try {
      // Generate file path and save file
      const path = `attachments/${generateFileName(file)}`;
      await saveFile(file, path);

      // Create document with single query that validates courseOnSemester belongs to lecturer
      return await this.prisma.courseDocument.create({
        data: {
          title,
          path,
          courseOnSemester: {
            connect: {
              id: courseOnSemesterId,
              lecturerId: lecturerId,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'CourseOnSemester not found or you are not authorized to add documents to this course',
        );
      }
      this.logger.error('Failed to create document for lecturer', error.stack);
      throw new BadRequestException('Failed to create document');
    }
  }

  async updateForLecturer(
    id: string,
    title: string,
    lecturerId: string,
    file?: Express.Multer.File,
  ): Promise<CourseDocument> {
    try {
      // Handle file if provided
      let path: string | undefined;
      if (file) {
        path = `attachments/${generateFileName(file)}`;
        await saveFile(file, path);
      }

      // Update only if the courseOnSemester belongs to the lecturer - single query
      return await this.prisma.courseDocument.update({
        where: {
          id,
          courseOnSemester: {
            lecturerId: lecturerId,
          },
        },
        data: {
          title,
          ...(path && { path }),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to update document for lecturer', error.stack);
      throw new BadRequestException('Failed to update document');
    }
  }

  async deleteForLecturer(
    id: string,
    lecturerId: string,
  ): Promise<{ message: string }> {
    try {
      // Get document first to retrieve file path
      const document = await this.prisma.courseDocument.findFirst({
        where: {
          id,
          courseOnSemester: {
            lecturerId: lecturerId,
          },
        },
      });

      if (!document) {
        throw new NotFoundException(
          'Document not found or you are not authorized to delete this document',
        );
      }

      // Delete file from filesystem
      await deleteFile(document.path);

      // Delete document from database
      await this.prisma.courseDocument.delete({
        where: { id },
      });

      return { message: 'Document deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete document for lecturer', error.stack);
      throw new BadRequestException('Failed to delete document');
    }
  }
}
