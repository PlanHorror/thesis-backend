import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Post, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    includeAdmin = false,
    includeDepartment = false,
  ): Promise<Post[]> {
    return await this.prisma.post.findMany({
      include: {
        admin: includeAdmin,
        department: includeDepartment,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(
    id: string,
    includeAdmin = false,
    includeDepartment = false,
  ): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        admin: includeAdmin,
        department: includeDepartment,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findByDepartmentId(
    departmentId: string | null,
    includeAdmin = false,
    includeDepartment = false,
  ): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: { departmentId },
      include: {
        admin: includeAdmin,
        department: includeDepartment,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findGlobalPosts(
    includeAdmin = false,
    includeDepartment = false,
  ): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: { departmentId: null },
      include: {
        admin: includeAdmin,
        department: includeDepartment,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    try {
      const post = await this.prisma.post.create({
        data,
        include: {
          admin: true,
          department: true,
        },
      });

      // Emit event for post created
      this.eventEmitter.emit('post.created', post);

      return post;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Admin or Department not found');
      }
      this.logger.error('Failed to create post', error.stack);
      throw new BadRequestException('Failed to create post');
    }
  }

  async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    try {
      const post = await this.prisma.post.update({
        where: { id },
        data,
        include: {
          admin: true,
          department: true,
        },
      });

      // Emit event for post updated
      this.eventEmitter.emit('post.updated', post);

      return post;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      this.logger.error('Failed to update post', error.stack);
      throw new BadRequestException('Failed to update post');
    }
  }

  async delete(id: string): Promise<Post> {
    try {
      return await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      this.logger.error('Failed to delete post', error.stack);
      throw new BadRequestException('Failed to delete post');
    }
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    try {
      return await this.prisma.post.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      this.logger.error('Failed to delete posts', error.stack);
      throw new BadRequestException('Failed to delete posts');
    }
  }
}
