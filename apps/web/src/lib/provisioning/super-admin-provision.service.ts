import {
  generateOwnerEmailFromSlug,
  generateStrongPassword,
  slugifyOrganizationName,
} from "./generators";
import type {
  ProvisionInput,
  ProvisionResult,
  ProvisioningAuthGateway,
} from "./types";

export class SuperAdminProvisionService {
  constructor(private readonly authGateway: ProvisioningAuthGateway) {}

  async provision(input: ProvisionInput): Promise<ProvisionResult> {
    const organizationName = input.organizationName.trim();
    if (!organizationName) {
      throw new Error("Organization name is required.");
    }

    const baseSlug = slugifyOrganizationName(
      input.organizationSlug?.trim() || organizationName,
    );
    const slug = await this.makeUniqueSlug(baseSlug);

    const ownerName = (input.ownerName?.trim() || `${organizationName} Admin`).slice(
      0,
      120,
    );
    const ownerEmail = (input.ownerEmail?.trim() || generateOwnerEmailFromSlug(slug))
      .toLowerCase()
      .slice(0, 254);
    const ownerPassword = input.ownerPassword || generateStrongPassword(20);

    const owner = await this.authGateway.createUser({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
    });

    const organization = await this.authGateway.createOrganization({
      name: organizationName,
      slug,
      userId: owner.id,
    });

    return {
      organization,
      owner,
      generated: {
        slug,
        email: ownerEmail,
        password: ownerPassword,
      },
    };
  }

  private async makeUniqueSlug(baseSlug: string): Promise<string> {
    if (!(await this.authGateway.isOrganizationSlugTaken(baseSlug))) {
      return baseSlug;
    }
    for (let i = 2; i <= 9999; i += 1) {
      const candidate = `${baseSlug}-${i}`;
      if (!(await this.authGateway.isOrganizationSlugTaken(candidate))) {
        return candidate;
      }
    }
    throw new Error("Could not generate a unique organization slug.");
  }
}
