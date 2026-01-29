-- DropForeignKey
ALTER TABLE "public"."WebhookLog" DROP CONSTRAINT "WebhookLog_webhookId_fkey";

-- AddForeignKey
ALTER TABLE "public"."WebhookLog" ADD CONSTRAINT "WebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "public"."Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
