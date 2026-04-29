import { Injectable, Logger } from "@nestjs/common";
import { CallsService } from "../calls/calls.service";
import type { CrmSource } from "../calls/call.entity";

export interface CrmWebhookPayload {
  tenantId: string;
  crmSource: CrmSource;
  crmLeadId: string;
  crmUserId: string;
  audioUrl: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly callsService: CallsService) {}

  async handleCrmWebhook(payload: CrmWebhookPayload) {
    this.logger.log(
      `Received webhook from ${payload.crmSource} for tenant ${payload.tenantId}`,
    );

    const call = await this.callsService.create({
      tenantId: payload.tenantId,
      crmSource: payload.crmSource,
      crmLeadId: payload.crmLeadId,
      crmUserId: payload.crmUserId,
      audioUrl: payload.audioUrl,
      status: "pending",
    });

    // TODO: trigger Temporal workflow — call.id + call.tenantId as inputs
    this.logger.log(`Call created: ${call.id} — Temporal workflow to be triggered`);

    return { callId: call.id, status: "queued" };
  }
}
