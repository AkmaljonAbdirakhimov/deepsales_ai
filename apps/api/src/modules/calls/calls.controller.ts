import { Controller, Get, Param } from "@nestjs/common";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { CallsService } from "./calls.service";

@Controller("calls")
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  findAll(@Session() session: UserSession) {
    /**
     * organizationId is the active org (tenant) on the session.
     * Better Auth sets this when the user switches/selects an org.
     */
    const tenantId = session.session.activeOrganizationId ?? "";
    return this.callsService.findAllByTenant(tenantId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Session() session: UserSession) {
    const tenantId = session.session.activeOrganizationId ?? "";
    return this.callsService.findOneByTenant(id, tenantId);
  }
}
