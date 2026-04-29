import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { SuperAdminProvisionService } from "@/lib/provisioning/super-admin-provision.service";
import type { ProvisioningAuthGateway } from "@/lib/provisioning/types";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const pool = getDbPool();
  const gateway: ProvisioningAuthGateway = {
    async createUser(input) {
      const result = await auth.api.createUser({
        headers: request.headers,
        body: {
          email: input.email,
          name: input.name,
          password: input.password,
          role: "user",
        },
      });
      return {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      };
    },

    async createOrganization(input) {
      const result = await auth.api.createOrganization({
        headers: request.headers,
        body: {
          name: input.name,
          slug: input.slug,
          userId: input.userId,
          keepCurrentActiveOrganization: true,
        },
      });
      return { id: result.id, name: result.name, slug: result.slug };
    },

    async isOrganizationSlugTaken(slug: string) {
      const { rows } = await pool.query<{ exists: boolean }>(
        `SELECT EXISTS(SELECT 1 FROM organization WHERE slug = $1)`,
        [slug],
      );
      return rows[0]?.exists ?? false;
    },
  };

  const service = new SuperAdminProvisionService(gateway);

  try {
    const result = await service.provision(
      payload as {
        organizationName: string;
        organizationSlug?: string;
        ownerName?: string;
        ownerEmail?: string;
        ownerPassword?: string;
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
