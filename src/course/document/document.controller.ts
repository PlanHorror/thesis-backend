import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { GetUser } from 'common/decorator/getuser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard } from 'common';
import { type Lecturer } from '@prisma/client';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Get all documents for the authenticated user
  @UseGuards(AuthGuard('accessToken'))
  @Get('all')
  async getAllDocuments() {
    return this.documentService.findAll();
  }

  @UseGuards(AuthGuard('accessToken'))
  @Get(':id')
  async getDocumentById(@Query('id') id: string) {
    return this.documentService.findById(id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @UseInterceptors(FileInterceptor('file'))
  @Post('create')
  async createDocument(
    @Body() data: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.documentService.createForLecturer(
      data.title,
      data.courseOnSemesterId,
      lecturer.id,
      file,
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @UseInterceptors(FileInterceptor('file'))
  @Patch('update/:id')
  async updateDocument(
    @Param('id') id: string,
    @Body() data: UpdateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.documentService.updateForLecturer(
      id,
      data.title,
      lecturer.id,
      file,
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Delete('delete/:id')
  async deleteDocument(@Param('id') id: string, @GetUser() lecturer: Lecturer) {
    return this.documentService.deleteForLecturer(id, lecturer.id);
  }
}
