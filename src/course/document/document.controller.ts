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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { GetUser } from 'common/decorator/getuser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard } from 'common';
import { type Lecturer } from '@prisma/client';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@ApiTags('Course Documents')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Get all documents for the authenticated user
  @UseGuards(AuthGuard('accessToken'))
  @Get('all')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({
    status: 200,
    description: 'List of all documents returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllDocuments() {
    return this.documentService.findAll();
  }

  @UseGuards(AuthGuard('accessToken'))
  @Get(':id')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiQuery({ name: 'id', description: 'Document ID', required: true })
  @ApiResponse({ status: 200, description: 'Document found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(@Query('id') id: string) {
    return this.documentService.findById(id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @UseInterceptors(FileInterceptor('file'))
  @Post('create')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Create a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document creation data with file upload',
    type: CreateDocumentDto,
  })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Update a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document update data with optional file upload',
    type: UpdateDocumentDto,
  })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string, @GetUser() lecturer: Lecturer) {
    return this.documentService.deleteForLecturer(id, lecturer.id);
  }
}
