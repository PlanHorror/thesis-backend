import { Module } from "@nestjs/common";
import { OptionalAuthGuard } from "common";
import { AuthModule } from "src/auth/auth.module";
import { PrismaService } from "src/prisma/prisma.service";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";

@Module({
  imports: [AuthModule],
  controllers: [PostController],
  providers: [PostService, PrismaService, OptionalAuthGuard],
  exports: [PostService],
})
export class PostModule {}
