import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateSupportRequestDto } from "./dto/create-support-request.dto";
import { SupportRequestService } from "./support-request.service";

@ApiTags("Support Request")
@Controller("support-request")
export class SupportRequestController {
  constructor(private readonly supportRequestService: SupportRequestService) {}

  @Post()
  @ApiOperation({ summary: "Submit a support request (public)" })
  @ApiBody({ type: CreateSupportRequestDto })
  @ApiResponse({ status: 201, description: "Request created" })
  @ApiResponse({ status: 400, description: "Bad request or rate limited" })
  async create(@Body() dto: CreateSupportRequestDto) {
    return this.supportRequestService.create({
      name: dto.name,
      email: dto.email,
      role: dto.role,
      category: dto.category,
      subject: dto.subject,
      message: dto.message,
      userId: dto.userId,
    });
  }
}
