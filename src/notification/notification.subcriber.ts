import { Injectable } from '@nestjs/common';
import { AppGateway } from 'src/gateway/gateway.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebhookService } from 'src/webhook/webhook.service';

@Injectable()
export class NotificationSubscriber {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webSocketGateway: AppGateway,
    private readonly webhookGateway: WebhookService,
  ) {}
}
