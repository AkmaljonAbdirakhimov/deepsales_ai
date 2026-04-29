import { Controller, Post, Body, Param, HttpCode } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { WebhooksService, CrmWebhookPayload } from "./webhooks.service";

/**
 * Public endpoint — CRM platforms POST here.
 * @AllowAnonymous skips the global Better Auth guard.
 * Webhook secret validation (per-tenant HMAC) is handled inside WebhooksService.
 *
 * Route: POST /api/v1/webhooks/:tenantId/:crmSource
 */
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(":tenantId/:crmSource")
  @AllowAnonymous()
  @HttpCode(202)
  handleWebhook(
    @Param("tenantId") tenantId: string,
    @Param("crmSource") crmSource: CrmWebhookPayload["crmSource"],
    @Body() body: Omit<CrmWebhookPayload, "tenantId" | "crmSource">,
  ) {
    return this.webhooksService.handleCrmWebhook({
      tenantId,
      crmSource,
      ...body,
    });
  }
}
