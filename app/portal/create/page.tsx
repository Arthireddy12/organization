import { normalizeOrganizationRoleAccessSetup } from "@/lib/organization-role-access";
import { normalizeOrganizationAttributeSetup } from "@/lib/organization-attributes";
import { normalizeOrganizationGroupDefinitionSetup } from "@/lib/organization-group-definition";
import { normalizeOrganizationPacketSetup } from "@/lib/organization-packets";
import { getSessionFromCookie } from "@/lib/auth";
import { normalizeModuleAccessToArray } from "@/lib/organization";
import { resolveOrganizationSetupProfile } from "@/lib/organization-setup";
import { findOrganizationById } from "@/app/repositories/organization";
import { redirect } from "next/navigation";
import CreateOrganizationForm from "./CreateOrganizationForm";

type CreateOrganizationPageProps = {
  searchParams?: Promise<{
    id?: string;
    mode?: string;
    step?: string;
  }>;
};

export default async function CreateOrganizationPage({
  searchParams,
}: CreateOrganizationPageProps) {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const organizationId = resolvedSearchParams.id;
  const parsedStep = Number(resolvedSearchParams.step ?? "1");
  const initialStep =
    parsedStep === 1 || parsedStep === 2 || parsedStep === 3 || parsedStep === 4 || parsedStep === 5
      ? parsedStep
      : 1;
  const mode = resolvedSearchParams.mode === "view" ? "view" : resolvedSearchParams.mode === "edit" ? "edit" : "create";

  if (!organizationId) {
    return <CreateOrganizationForm mode="create" initialStep={initialStep} />;
  }

  const organization = await findOrganizationById(organizationId);

  if (!organization) {
    redirect("/portal/organizations");
  }

  return (
    <CreateOrganizationForm
      mode={mode}
      initialStep={
        initialStep !== 1
          ? initialStep
          : organization.setupCurrentStep &&
              [1, 2, 3, 4, 5].includes(organization.setupCurrentStep)
            ? (organization.setupCurrentStep as 1 | 2 | 3 | 4 | 5)
            : 1
      }
      initialOrganization={{
        id: organization.id,
        organizationName: organization.name,
        organizationEmail: organization.email ?? "",
        phoneNumber: organization.phone ?? "",
        industry: organization.industry ?? "",
        address: organization.address ?? "",
        superAdminName: organization.adminName ?? "",
        superAdminEmail: organization.adminEmail ?? "",
        adminPhone: organization.adminPhone ?? "",
        designation: organization.adminDesignation ?? "",
        systemDomain: organization.systemDomain ?? "",
        customDomain: organization.customDomain ?? "",
        startDate: organization.startDate?.toISOString() ?? null,
        autoDeactivateDate: organization.autoDeactivateDate?.toISOString() ?? null,
        isActive: organization.isActive,
        userLimit: organization.userLimit ?? 25,
        moduleAccess: normalizeModuleAccessToArray(organization.moduleAccess),
        setupProfile: resolveOrganizationSetupProfile(
          organization.setupProfile,
          organization.address,
        ),
        attributeSetup: normalizeOrganizationAttributeSetup(organization.attributeSetup),
        roleAccessSetup: normalizeOrganizationRoleAccessSetup(organization.roleAccessSetup),
        groupDefinitionSetup: normalizeOrganizationGroupDefinitionSetup(
          organization.groupDefinitionSetup,
        ),
        packetSetup: normalizeOrganizationPacketSetup(organization.packetSetup),
        setupStatus: organization.setupStatus ?? null,
        setupCurrentStep: organization.setupCurrentStep ?? null,
        setupCompletedSteps: organization.setupCompletedSteps ?? [],
      }}
    />
  );
}
