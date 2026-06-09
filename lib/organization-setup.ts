export type BranchOffice = {
  id: string;
  name: string;
  location: string;
  subLocation: string;
};

export type OrganizationSetupProfile = {
  country: string;
  employeeCountRange: string;
  encryption: string;
  streetAddress: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  registeredCountry: string;
  website: string;
  branchOffices: BranchOffice[];
  currency: string;
  financialYearEndDay: string;
  financialYearEndMonth: string;
  panNumber: string;
  aadhaarNumber: string;
  tanNumber: string;
  pfAccountNumber: string;
};

export const defaultOrganizationSetupProfile: OrganizationSetupProfile = {
  country: "India",
  employeeCountRange: "",
  encryption: "Not Applicable",
  streetAddress: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  registeredCountry: "India",
  website: "",
  branchOffices: [],
  currency: "Rupee",
  financialYearEndDay: "31",
  financialYearEndMonth: "March",
  panNumber: "",
  aadhaarNumber: "",
  tanNumber: "",
  pfAccountNumber: "",
};

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeBranchOffices(value: unknown) {
  if (!Array.isArray(value)) return defaultOrganizationSetupProfile.branchOffices;

  return value.reduce<BranchOffice[]>((branches, item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return branches;
    }

    const branch = item as Partial<BranchOffice>;
    branches.push({
      id: normalizeString(branch.id, `branch-${index + 1}`),
      name: normalizeString(branch.name),
      location: normalizeString(branch.location),
      subLocation: normalizeString(branch.subLocation),
    });
    return branches;
  }, []);
}

export function normalizeOrganizationSetupProfile(
  value: unknown,
): OrganizationSetupProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultOrganizationSetupProfile };
  }

  const profile = value as Partial<OrganizationSetupProfile>;

  return {
    country: normalizeString(profile.country, defaultOrganizationSetupProfile.country),
    employeeCountRange: normalizeString(profile.employeeCountRange),
    encryption: normalizeString(
      profile.encryption,
      defaultOrganizationSetupProfile.encryption,
    ),
    streetAddress: normalizeString(profile.streetAddress),
    city: normalizeString(profile.city),
    stateRegion: normalizeString(profile.stateRegion),
    postalCode: normalizeString(profile.postalCode),
    registeredCountry: normalizeString(
      profile.registeredCountry,
      defaultOrganizationSetupProfile.registeredCountry,
    ),
    website: normalizeString(profile.website),
    branchOffices: normalizeBranchOffices(profile.branchOffices),
    currency: normalizeString(profile.currency, defaultOrganizationSetupProfile.currency),
    financialYearEndDay: normalizeString(
      profile.financialYearEndDay,
      defaultOrganizationSetupProfile.financialYearEndDay,
    ),
    financialYearEndMonth: normalizeString(
      profile.financialYearEndMonth,
      defaultOrganizationSetupProfile.financialYearEndMonth,
    ),
    panNumber: normalizeString(profile.panNumber),
    aadhaarNumber: normalizeString(profile.aadhaarNumber),
    tanNumber: normalizeString(profile.tanNumber),
    pfAccountNumber: normalizeString(profile.pfAccountNumber),
  };
}

export function resolveOrganizationSetupProfile(
  value: unknown,
  fallbackAddress?: string | null,
): OrganizationSetupProfile {
  const profile = normalizeOrganizationSetupProfile(value);
  if (profile.streetAddress.trim() || !fallbackAddress?.trim()) {
    return profile;
  }

  return {
    ...profile,
    streetAddress: fallbackAddress.trim(),
  };
}

export function buildOrganizationAddressFromSetupProfile(
  profile: OrganizationSetupProfile,
) {
  const cityLine = [profile.city, profile.stateRegion]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
  const postalLine = [profile.postalCode, profile.registeredCountry]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");
  const websiteLine = profile.website.trim()
    ? `Website: ${profile.website.trim()}`
    : "";

  return [profile.streetAddress.trim(), cityLine, postalLine, websiteLine]
    .filter(Boolean)
    .join("\n");
}
