import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Lecturer, Student } from "@prisma/client";
import { GetUser, Role, RoleGuard } from "common";
import { AiService } from "./ai.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";

type UserWithRole = (Student | Lecturer) & { role: Role };

@ApiTags("AI Chat")
@Controller("ai")
@UseGuards(
  AuthGuard("accessToken"),
  new RoleGuard([Role.STUDENT, Role.LECTURER]),
)
@ApiBearerAuth("accessToken")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get("consent")
  @ApiOperation({ summary: "Get AI consent status for current user" })
  @ApiResponse({ status: 200, description: "Consent status returned" })
  getConsent(@GetUser() user: UserWithRole) {
    return this.aiService.getConsent(user, user.role);
  }

  @Post("consent")
  @ApiOperation({ summary: "Accept AI data usage consent" })
  @ApiResponse({ status: 200, description: "Consent accepted" })
  async acceptConsent(
    @Body() body: { version: string },
    @GetUser() user: UserWithRole,
  ) {
    return this.aiService.acceptConsent(user, user.role, body.version ?? "v1");
  }

  @Get("conversations")
  @ApiOperation({ summary: "List user conversations" })
  @ApiResponse({
    status: 200,
    description: "Conversations returned successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student or Lecturer only",
  })
  async listConversations(@GetUser() user: UserWithRole) {
    return this.aiService.listConversations(user, user.role);
  }

  @Post("conversations")
  @ApiOperation({ summary: "Create a new conversation" })
  @ApiResponse({
    status: 201,
    description: "Conversation created successfully",
  })
  @ApiResponse({ status: 400, description: "Max 5 conversations reached" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @GetUser() user: UserWithRole,
  ) {
    return this.aiService.createConversation(user, user.role, dto);
  }

  @Get("conversations/:id")
  @ApiOperation({ summary: "Get conversation with messages" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "Conversation found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  async getConversation(
    @Param("id") id: string,
    @GetUser() user: UserWithRole,
  ) {
    return this.aiService.getConversation(id, user, user.role);
  }

  @Patch("conversations/:id")
  @ApiOperation({ summary: "Update conversation (e.g. title)" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "Updated" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  async updateConversation(
    @Param("id") id: string,
    @Body() dto: UpdateConversationDto,
    @GetUser() user: UserWithRole,
  ) {
    return this.aiService.updateConversation(id, user, user.role, dto);
  }

  @Delete("conversations/:id")
  @ApiOperation({ summary: "Delete conversation" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "Deleted" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  async deleteConversation(
    @Param("id") id: string,
    @GetUser() user: UserWithRole,
  ) {
    return this.aiService.deleteConversation(id, user, user.role);
  }

  @Post("conversations/:id/messages")
  @ApiOperation({ summary: "Send message and get AI reply" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 201, description: "Message sent, reply returned" })
  @ApiResponse({ status: 404, description: "Not found" })
  async sendMessage(
    @Param("id") id: string,
    @Body() dto: SendMessageDto,
    @GetUser() user: UserWithRole,
  ) {
    return this.aiService.sendMessage(id, user, user.role, dto);
  }
}
