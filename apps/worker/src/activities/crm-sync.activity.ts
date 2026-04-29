import { log } from "@temporalio/activity";
import type { AnalysisResult } from "./analyze.activity";

export interface CrmSyncInput {
  callId: string;
  tenantId: string;
  crmSource: "amocrm" | "bitrix24" | "odoo";
  crmLeadId: string;
  crmUserId: string;
  analysis: AnalysisResult;
}

/**
 * Pushes analysis results back to the CRM:
 * - Attaches a note with the summary
 * - Updates deal/lead fields (scores)
 * - Creates a follow-up task if needed
 */
export async function syncToCrm(input: CrmSyncInput): Promise<void> {
  log.info("Syncing to CRM", {
    callId: input.callId,
    crm: input.crmSource,
  });

  // TODO: instantiate the correct CRM adapter based on input.crmSource
  // e.g. AmoCrmAdapter | Bitrix24Adapter | OdooAdapter
}
