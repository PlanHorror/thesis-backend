import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

const SUPPORT_REQUEST_COOLDOWN_HOURS = 24;

@Injectable()
export class SupportRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    role: string;
    category: string;
    subject: string;
    message: string;
    userId?: string;
  }) {
    const since = new Date();
    since.setHours(since.getHours() - SUPPORT_REQUEST_COOLDOWN_HOURS);

    const recent = await this.prisma.supportRequest.findFirst({
      where: {
        email: data.email.trim().toLowerCase(),
        createdAt: { gte: since },
      },
    });

    if (recent) {
      throw new BadRequestException(
        `You can only submit one support request every ${SUPPORT_REQUEST_COOLDOWN_HOURS} hours. Please try again after ${recent.createdAt.toISOString()}.`,
      );
    }

    return this.prisma.supportRequest.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
        category: data.category,
        subject: data.subject.trim(),
        message: data.message.trim(),
        userId: data.userId ?? null,
      },
    });
  }

  async findAll() {
    return await this.prisma.supportRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
