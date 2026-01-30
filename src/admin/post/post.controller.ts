import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { CreatePostDto, UpdatePostDto } from 'src/admin/dto/post.dto';
import { GetUser } from 'common';
import type { Admin } from '@prisma/client';

@Controller('admin/post')
export class PostController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async getAllPosts(
    @Query('includeAdmin') includeAdmin?: string,
    @Query('includeDepartment') includeDepartment?: string,
  ) {
    return await this.adminService.getAllPostsService(
      includeAdmin === 'true',
      includeDepartment === 'true',
    );
  }

  @Get('find/:id')
  async getPostById(
    @Param('id') id: string,
    @Query('includeAdmin') includeAdmin?: string,
    @Query('includeDepartment') includeDepartment?: string,
  ) {
    return await this.adminService.getPostByIdService(
      id,
      includeAdmin === 'true',
      includeDepartment === 'true',
    );
  }

  @Get('department/:departmentId')
  async getPostsByDepartment(
    @Param('departmentId') departmentId: string,
    @Query('includeAdmin') includeAdmin?: string,
    @Query('includeDepartment') includeDepartment?: string,
  ) {
    return await this.adminService.getPostsByDepartmentIdService(
      departmentId,
      includeAdmin === 'true',
      includeDepartment === 'true',
    );
  }

  @Get('global')
  async getGlobalPosts(
    @Query('includeAdmin') includeAdmin?: string,
    @Query('includeDepartment') includeDepartment?: string,
  ) {
    return await this.adminService.getGlobalPostsService(
      includeAdmin === 'true',
      includeDepartment === 'true',
    );
  }

  @Post('create')
  async createPost(@Body() data: CreatePostDto, @GetUser() admin: Admin) {
    return await this.adminService.createPostService(data, admin.id);
  }

  @Patch('update/:id')
  async updatePost(@Param('id') id: string, @Body() data: UpdatePostDto) {
    return await this.adminService.updatePostService(id, data);
  }

  @Delete('delete/:id')
  async deletePost(@Param('id') id: string) {
    return await this.adminService.deletePostService(id);
  }

  @Delete('delete')
  async deleteManyPosts(@Query('ids') ids: string) {
    return await this.adminService.deleteManyPostsService(ids.split(','));
  }
}
