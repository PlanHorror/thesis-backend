import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GatewayModule } from 'src/gateway/gateway.module';
import { NotificationSubscriber } from './notification.subcriber';
import { WebhookModule } from 'src/webhook/webhook.module';
import { NotificationScheduler } from './notification.scheduler';

@Module({
  imports: [forwardRef(() => GatewayModule), forwardRef(() => WebhookModule)],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    PrismaService,
    NotificationSubscriber,
    NotificationScheduler,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
