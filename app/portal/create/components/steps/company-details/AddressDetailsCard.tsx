import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import type { OrganizationSetupProfile } from "@/lib/organization-setup";
import {
  SetupField,
  SetupSectionTitle,
  setupCardClassName,
} from "../../SetupField";

export default function AddressDetailsCard({
  disabled,
  setupProfile,
  errors,
  onSetupProfileChange,
}: {
  disabled: boolean;
  setupProfile: OrganizationSetupProfile;
  errors?: Partial<Record<string, string>>;
  onSetupProfileChange: (field: keyof OrganizationSetupProfile, value: string) => void;
}) {
  return (
    <section className={setupCardClassName}>
      <SetupSectionTitle title="Basic Information" />
      <div className="mt-4 space-y-4">
        <SetupField
          label="Street Address or P.O. Box"
          required
          error={errors?.streetAddress}
        >
          <Textarea
            value={setupProfile.streetAddress}
            onChange={(event) => onSetupProfileChange("streetAddress", event.target.value)}
            readOnly={disabled}
            placeholder="Enter street address or P.O. box"
            required
          />
        </SetupField>

        <div className="grid gap-4 sm:grid-cols-2">
          <SetupField label="Town/City" error={errors?.city}>
            <Input
              value={setupProfile.city}
              onChange={(event) => onSetupProfileChange("city", event.target.value)}
              readOnly={disabled}
              placeholder="Enter town or city"
            />
          </SetupField>

          <SetupField label="State/Region" error={errors?.stateRegion}>
            <Input
              value={setupProfile.stateRegion}
              onChange={(event) => onSetupProfileChange("stateRegion", event.target.value)}
              readOnly={disabled}
              placeholder="Enter state or region"
            />
          </SetupField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SetupField label="Postal Code" error={errors?.postalCode}>
            <Input
              value={setupProfile.postalCode}
              onChange={(event) => onSetupProfileChange("postalCode", event.target.value)}
              readOnly={disabled}
              placeholder="Enter postal code"
            />
          </SetupField>

          <SetupField label="Country">
            <Input
              value={setupProfile.registeredCountry}
              onChange={(event) =>
                onSetupProfileChange("registeredCountry", event.target.value)
              }
              readOnly={disabled}
              placeholder="Enter registered country"
            />
          </SetupField>
        </div>

        <SetupField label="Website" error={errors?.website}>
          <Input
            value={setupProfile.website}
            onChange={(event) => onSetupProfileChange("website", event.target.value)}
            readOnly={disabled}
            placeholder="Enter website URL"
          />
        </SetupField>
      </div>
    </section>
  );
}
