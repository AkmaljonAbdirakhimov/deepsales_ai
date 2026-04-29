export interface ProvisionInput {
  organizationName: string;
  organizationSlug?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPassword?: string;
}

export interface ProvisionResult {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  generated: {
    slug: string;
    email: string;
    password: string;
  };
}

export interface ProvisioningAuthGateway {
  createUser(input: { name: string; email: string; password: string }): Promise<{
    id: string;
    name: string;
    email: string;
  }>;
  createOrganization(input: {
    name: string;
    slug: string;
    userId: string;
  }): Promise<{ id: string; name: string; slug: string }>;
  isOrganizationSlugTaken(slug: string): Promise<boolean>;
}
