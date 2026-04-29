import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "../tenants/tenant.entity";

export type CallStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type CrmSource = "amocrm" | "bitrix24" | "odoo";

@Entity("calls")
export class Call {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  tenantId!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant!: Tenant;

  @Column({ type: "varchar" })
  crmSource!: CrmSource;

  @Column({ nullable: true })
  crmLeadId!: string;

  @Column({ nullable: true })
  crmUserId!: string;

  @Column({ nullable: true })
  audioUrl!: string;

  @Column({ type: "varchar", default: "pending" })
  status!: CallStatus;

  /** Populated after AI analysis */
  @Column({ type: "jsonb", nullable: true })
  analysisResult!: Record<string, unknown> | null;

  @Column({ nullable: true })
  temporalWorkflowId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
