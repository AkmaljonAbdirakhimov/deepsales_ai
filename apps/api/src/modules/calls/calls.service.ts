import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Call, CallStatus } from "./call.entity";

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call)
    private readonly callsRepo: Repository<Call>,
  ) {}

  findAllByTenant(tenantId: string): Promise<Call[]> {
    return this.callsRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  async findOneByTenant(id: string, tenantId: string): Promise<Call> {
    const call = await this.callsRepo.findOne({ where: { id, tenantId } });
    if (!call) throw new NotFoundException(`Call ${id} not found`);
    return call;
  }

  create(data: Partial<Call>): Promise<Call> {
    return this.callsRepo.save(this.callsRepo.create(data));
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: CallStatus,
    analysisResult?: Record<string, unknown>,
  ): Promise<Call> {
    const call = await this.findOneByTenant(id, tenantId);
    call.status = status;
    if (analysisResult !== undefined) call.analysisResult = analysisResult;
    return this.callsRepo.save(call);
  }
}
