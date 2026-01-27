import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service';
import { GetUser } from 'common/decorator/getuser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'common';
import { Lecturer } from '@prisma/client';

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
}
