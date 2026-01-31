import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PostService } from './post.service';

@ApiTags('Posts')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get all global posts' })
  @ApiQuery({
    name: 'includeAdmin',
    description: 'Include admin information',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    description: 'Include department information',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Global posts returned successfully',
  })
  async getGlobalPosts(
    @Query('includeAdmin') includeAdmin?: string,
    @Query('includeDepartment') includeDepartment?: string,
  ) {
    return await this.postService.findGlobalPosts(
      includeAdmin === 'true',
      includeDepartment === 'true',
    );
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get posts by department' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiQuery({
    name: 'includeAdmin',
    description: 'Include admin information',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    description: 'Include department information',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Department posts returned successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getPostsByDepartment(
    @Param('departmentId') departmentId: string,
    @Query('includeAdmin') includeAdmin?: string,
    @Query('includeDepartment') includeDepartment?: string,
  ) {
    return await this.postService.findByDepartmentId(
      departmentId,
      includeAdmin === 'true',
      includeDepartment === 'true',
    );
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiQuery({
    name: 'includeAdmin',
    description: 'Include admin information',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    description: 'Include department information',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Post found successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostById(
    @Param('id') id: string,
    @Query('includeAdmin') includeAdmin?: string,
    @Query('includeDepartment') includeDepartment?: string,
  ) {
    return await this.postService.findById(
      id,
      includeAdmin === 'true',
      includeDepartment === 'true',
    );
  }
}
