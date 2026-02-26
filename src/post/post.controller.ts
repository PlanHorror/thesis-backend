import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IsAuthenticated, OptionalAuthGuard } from "common";
import { PostService } from "./post.service";

@ApiTags("Posts")
@Controller("post")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get("feed")
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: "Get posts feed",
    description:
      "Authenticated users see all posts. Unauthenticated users see only isPublic posts.",
  })
  @ApiQuery({
    name: "includeAdmin",
    description: "Include admin information",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "includeDepartment",
    description: "Include department information",
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Posts returned successfully",
  })
  async getFeed(
    @IsAuthenticated() authenticated: boolean,
    @Query("includeAdmin") includeAdmin?: string,
    @Query("includeDepartment") includeDepartment?: string,
  ) {
    return await this.postService.findFeedPosts(
      authenticated,
      includeAdmin === "true",
      includeDepartment === "true",
    );
  }

  @Get("global")
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: "Get global posts",
    description:
      "Authenticated: all global posts. Unauthenticated: only isPublic.",
  })
  @ApiQuery({
    name: "includeAdmin",
    description: "Include admin information",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "includeDepartment",
    description: "Include department information",
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Global posts returned successfully",
  })
  async getGlobalPosts(
    @IsAuthenticated() authenticated: boolean,
    @Query("includeAdmin") includeAdmin?: string,
    @Query("includeDepartment") includeDepartment?: string,
  ) {
    return await this.postService.findGlobalFeedPosts(
      authenticated,
      includeAdmin === "true",
      includeDepartment === "true",
    );
  }

  @Get("department/:departmentId")
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: "Get posts by department",
    description:
      "Authenticated: all department posts. Unauthenticated: only isPublic.",
  })
  @ApiParam({ name: "departmentId", description: "Department ID" })
  @ApiQuery({
    name: "includeAdmin",
    description: "Include admin information",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "includeDepartment",
    description: "Include department information",
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Department posts returned successfully",
  })
  @ApiResponse({ status: 404, description: "Department not found" })
  async getPostsByDepartment(
    @IsAuthenticated() authenticated: boolean,
    @Param("departmentId") departmentId: string,
    @Query("includeAdmin") includeAdmin?: string,
    @Query("includeDepartment") includeDepartment?: string,
  ) {
    return await this.postService.findDepartmentFeedPosts(
      authenticated,
      departmentId,
      includeAdmin === "true",
      includeDepartment === "true",
    );
  }

  @Get("find/:id")
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: "Get post by ID",
    description:
      "Authenticated: any post. Unauthenticated: only isPublic posts.",
  })
  @ApiParam({ name: "id", description: "Post ID" })
  @ApiQuery({
    name: "includeAdmin",
    description: "Include admin information",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "includeDepartment",
    description: "Include department information",
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: "Post found successfully" })
  @ApiResponse({ status: 404, description: "Post not found" })
  async getPostById(
    @IsAuthenticated() authenticated: boolean,
    @Param("id") id: string,
    @Query("includeAdmin") includeAdmin?: string,
    @Query("includeDepartment") includeDepartment?: string,
  ) {
    return await this.postService.findPostByIdOrPublic(
      authenticated,
      id,
      includeAdmin === "true",
      includeDepartment === "true",
    );
  }
}
