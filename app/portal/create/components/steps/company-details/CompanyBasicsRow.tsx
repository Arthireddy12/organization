import { Input } from "@/components/common/input";
import type { OrganizationSetupProfile } from "@/lib/organization-setup";
import {
  employeeRangeOptions,
  encryptionOptions,
  industryOptions,
} from "../../constants";
import { SetupField, SetupSectionTitle } from "../../SetupField";
import SetupSelect from "../../SetupSelect";

type CompanyBasicsRowProps = {
  disabled: boolean;
  organizationName: string;
  industry: string;
  setupProfile: OrganizationSetupProfile;
  onOrganizationNameChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onSetupProfileChange: (field: keyof OrganizationSetupProfile, value: string) => void;
};

export default function CompanyBasicsRow({
  disabled,
  organizationName,
  industry,
  setupProfile,
  onOrganizationNameChange,
  onIndustryChange,
  onSetupProfileChange,
}: CompanyBasicsRowProps) {
  return (
    <div className="rounded-sm border border-slate-200 px-4 py-4">
      <SetupSectionTitle title="Basic Information" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SetupField label="Display Name" required hint="Name as it appears in HRMS">
          <Input
            value={organizationName}
            onChange={(event) => onOrganizationNameChange(event.target.value)}
            readOnly={disabled}
            placeholder="Enter organization display name"
          />
        </SetupField>

        <SetupField label="Country" required>
          <SetupSelect
            value={setupProfile.country}
            options={["India", "United States", "United Kingdom"]}
            onChange={(value) => onSetupProfileChange("country", value)}
            disabled={disabled}
            placeholder="Select organization country"
          />
        </SetupField>

        <SetupField label="Industry Vertical" required>
          <SetupSelect
            value={industry}
            options={industryOptions}
            onChange={onIndustryChange}
            disabled={disabled}
            placeholder="Select industry vertical"
          />
        </SetupField>

        <SetupField label="Number of Employee">
          <SetupSelect
            value={setupProfile.employeeCountRange}
            options={employeeRangeOptions}
            onChange={(value) => onSetupProfileChange("employeeCountRange", value)}
            disabled={disabled}
            placeholder="Select employee range"
          />
        </SetupField>

        <SetupField label="Encryption">
          <SetupSelect
            value={setupProfile.encryption}
            options={encryptionOptions}
            onChange={(value) => onSetupProfileChange("encryption", value)}
            disabled={disabled}
            placeholder="Select encryption type"
          />
        </SetupField>
      </div>
    </div>
  );
}
