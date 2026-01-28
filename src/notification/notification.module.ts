import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [forwardRef(() => GatewayModule)],
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}
