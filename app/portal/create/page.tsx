import { getSessionFromCookie } from "@/lib/auth";
import { normalizeModuleAccessToArray } from "@/lib/organization";
import { findOrganizationById } from "@/app/repositories/organization";
import { redirect } from "next/navigation";
import CreateOrganizationForm from "./CreateOrganizationForm";

type CreateOrganizationPageProps = {
  searchParams?: Promise<{
    id?: string;
    mode?: string;
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
  const mode = resolvedSearchParams.mode === "view" ? "view" : resolvedSearchParams.mode === "edit" ? "edit" : "create";

  if (!organizationId || mode === "create") {
    return <CreateOrganizationForm mode="create" />;
  }

  const organization = await findOrganizationById(organizationId);

  if (!organization) {
    redirect("/portal/organizations");
  }

  return (
    <CreateOrganizationForm
      mode={mode}
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
        startDate: organization.startDate?.toISOString() ?? null,
        autoDeactivateDate: organization.autoDeactivateDate?.toISOString() ?? null,
        isActive: organization.isActive,
        userLimit: organization.userLimit ?? 25,
        moduleAccess: normalizeModuleAccessToArray(organization.moduleAccess),
      }}
    />
  );
}
