import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
})
export class WebhookModule {}
