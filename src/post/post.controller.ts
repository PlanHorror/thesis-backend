import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('global')
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

  @Get(':id')
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
