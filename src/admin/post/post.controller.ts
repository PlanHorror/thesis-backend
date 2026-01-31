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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Posts')
@Controller('admin/post')
export class PostController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({
    name: 'includeAdmin',
    required: false,
    description: 'Include admin details',
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    required: false,
    description: 'Include department details',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all posts retrieved successfully',
  })
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
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID', type: String })
  @ApiQuery({
    name: 'includeAdmin',
    required: false,
    description: 'Include admin details',
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    required: false,
    description: 'Include department details',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
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
  @ApiOperation({ summary: 'Get posts by department ID' })
  @ApiParam({
    name: 'departmentId',
    description: 'Department ID',
    type: String,
  })
  @ApiQuery({
    name: 'includeAdmin',
    required: false,
    description: 'Include admin details',
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    required: false,
    description: 'Include department details',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
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
  @ApiOperation({ summary: 'Get global posts (not department-specific)' })
  @ApiQuery({
    name: 'includeAdmin',
    required: false,
    description: 'Include admin details',
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    required: false,
    description: 'Include department details',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Global posts retrieved successfully',
  })
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
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async createPost(@Body() data: CreatePostDto, @GetUser() admin: Admin) {
    return await this.adminService.createPostService(data, admin.id);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID', type: String })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(@Param('id') id: string, @Body() data: UpdatePostDto) {
    return await this.adminService.updatePostService(id, data);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID', type: String })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(@Param('id') id: string) {
    return await this.adminService.deletePostService(id);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete multiple posts' })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated list of post IDs to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Posts deleted successfully' })
  async deleteManyPosts(@Query('ids') ids: string) {
    return await this.adminService.deleteManyPostsService(ids.split(','));
  }
}
