import { CalendarDays, Globe2, Mail, Phone, User } from "lucide-react";
import { Input } from "@/components/common/input";
import { SYSTEM_DOMAIN_SUFFIX, buildSystemDomain } from "@/lib/organization";
import { SetupField, setupCardClassName } from "./SetupField";
import type { DomainType, FormMode } from "./types";

type PortalProvisionPanelProps = {
  mode: FormMode;
  domainType: DomainType;
  organizationEmail: string;
  phoneNumber: string;
  systemDomainName: string;
  customDomain: string;
  startDateLabel: string;
  autoDeactivateDate: string;
  superAdminName: string;
  superAdminEmail: string;
  superAdminPassword: string;
  adminPhone: string;
  designation: string;
  onDomainTypeChange: (value: DomainType) => void;
  onOrganizationEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onSystemDomainNameChange: (value: string) => void;
  onCustomDomainChange: (value: string) => void;
  onAutoDeactivateDateChange: (value: string) => void;
  onSuperAdminNameChange: (value: string) => void;
  onSuperAdminEmailChange: (value: string) => void;
  onSuperAdminPasswordChange: (value: string) => void;
  onAdminPhoneChange: (value: string) => void;
  onDesignationChange: (value: string) => void;
};

export default function PortalProvisionPanel({
  mode,
  domainType,
  organizationEmail,
  phoneNumber,
  systemDomainName,
  customDomain,
  startDateLabel,
  autoDeactivateDate,
  superAdminName,
  superAdminEmail,
  superAdminPassword,
  adminPhone,
  designation,
  onDomainTypeChange,
  onOrganizationEmailChange,
  onPhoneNumberChange,
  onSystemDomainNameChange,
  onCustomDomainChange,
  onAutoDeactivateDateChange,
  onSuperAdminNameChange,
  onSuperAdminEmailChange,
  onSuperAdminPasswordChange,
  onAdminPhoneChange,
  onDesignationChange,
}: PortalProvisionPanelProps) {
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const domainPreview =
    domainType === "system"
      ? buildSystemDomain(systemDomainName) || `yourname${SYSTEM_DOMAIN_SUFFIX}`
      : customDomain || "yourcompany.com";

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className={setupCardClassName}>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Globe2 className="h-4 w-4 text-blue-600" />
          Portal Access Details
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SetupField label="Organization Email" required>
            <Input
              value={organizationEmail}
              onChange={(event) => onOrganizationEmailChange(event.target.value)}
              readOnly={isViewMode}
              placeholder="Enter organization email"
              required
            />
          </SetupField>

          <SetupField label="Phone Number" required>
            <Input
              value={phoneNumber}
              onChange={(event) => onPhoneNumberChange(event.target.value)}
              readOnly={isViewMode}
              placeholder="Enter organization phone number"
              required
            />
          </SetupField>

          <div className="md:col-span-2">
            <SetupField
              label="Domain Type"
              required
              hint="Choose either a system domain or a custom domain"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onDomainTypeChange("system")}
                  disabled={isViewMode}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                    domainType === "system"
                      ? "border-blue-200 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } ${isViewMode ? "cursor-default" : ""}`}
                >
                  <span className="block font-semibold">System Domain</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Use the internal `{SYSTEM_DOMAIN_SUFFIX}` address
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDomainTypeChange("custom")}
                  disabled={isViewMode}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                    domainType === "custom"
                      ? "border-blue-200 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } ${isViewMode ? "cursor-default" : ""}`}
                >
                  <span className="block font-semibold">Custom Domain</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Use your own branded public domain
                  </span>
                </button>
              </div>
            </SetupField>
          </div>

          {domainType === "system" ? (
            <div className="md:col-span-2">
              <SetupField label="System Domain" required hint={`Suffix: ${SYSTEM_DOMAIN_SUFFIX}`}>
                <div className="flex">
                  <Input
                    className="rounded-r-none"
                    value={systemDomainName}
                    onChange={(event) => onSystemDomainNameChange(event.target.value)}
                    readOnly={isViewMode}
                    placeholder="Enter subdomain"
                    required
                  />
                  <div className="flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 shadow-sm">
                    {SYSTEM_DOMAIN_SUFFIX}
                  </div>
                </div>
              </SetupField>
            </div>
          ) : (
            <div className="md:col-span-2">
              <SetupField label="Custom Domain" required hint="Example: hr.yourcompany.com">
                <Input
                  value={customDomain}
                  onChange={(event) => onCustomDomainChange(event.target.value)}
                  readOnly={isViewMode}
                  placeholder="Enter custom domain"
                  required
                />
              </SetupField>
            </div>
          )}

          <SetupField label="Subscription Start Date">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 shadow-sm">
              <CalendarDays className="h-4 w-4" />
              {startDateLabel}
            </div>
          </SetupField>

          <SetupField label="Subscription End Date" required>
            <Input
              type="date"
              value={autoDeactivateDate}
              onChange={(event) => onAutoDeactivateDateChange(event.target.value)}
              readOnly={isViewMode}
              required
            />
          </SetupField>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Workspace preview: <span className="font-semibold">{domainPreview}</span>
        </div>
      </section>

      <section className={setupCardClassName}>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <User className="h-4 w-4 text-blue-600" />
          Primary Admin Details
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SetupField label="Admin Name" required>
            <Input
              value={superAdminName}
              onChange={(event) => onSuperAdminNameChange(event.target.value)}
              readOnly={isViewMode}
              placeholder="Enter admin full name"
              required
            />
          </SetupField>

          <SetupField label="Admin Email" required>
            <Input
              value={superAdminEmail}
              onChange={(event) => onSuperAdminEmailChange(event.target.value)}
              readOnly={isViewMode}
              placeholder="Enter admin email"
              required
            />
          </SetupField>

          <SetupField label="Admin Phone Number" required>
            <Input
              value={adminPhone}
              onChange={(event) => onAdminPhoneChange(event.target.value)}
              readOnly={isViewMode}
              placeholder="Enter admin phone number"
              required
            />
          </SetupField>

          <SetupField label="Designation" required>
            <Input
              value={designation}
              onChange={(event) => onDesignationChange(event.target.value)}
              readOnly={isViewMode}
              placeholder="Enter admin designation"
              required
            />
          </SetupField>

          {!isEditMode && !isViewMode ? (
            <div className="md:col-span-2">
              <SetupField label="Admin Password" required>
                <Input
                  type="password"
                  value={superAdminPassword}
                  onChange={(event) => onSuperAdminPasswordChange(event.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </SetupField>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Mail className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
            {superAdminEmail || "Admin email will appear here"}
          </div>
          <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Phone className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
            {adminPhone || "Admin phone will appear here"}
          </div>
        </div>
      </section>
    </div>
  );
}
