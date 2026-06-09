import type { OrganizationAttributeSetup } from "@/lib/organization-attributes";
import type { OrganizationGroupDefinitionSetup } from "@/lib/organization-group-definition";
import type { OrganizationPacketSetup } from "@/lib/organization-packets";
import type { OrganizationSetupProfile } from "@/lib/organization-setup";
import { SYSTEM_DOMAIN_SUFFIX, buildSystemDomain, normalizeCustomDomain } from "@/lib/organization";

export type ValidationErrorMap = Record<string, string>;

export type OrganizationSetupValidationInput = {
  isEditMode: boolean;
  organizationName?: string;
  organizationEmail?: string;
  phoneNumber?: string;
  industry?: string;
  setupProfile?: OrganizationSetupProfile;
  systemDomain?: string;
  customDomain?: string | null;
  superAdminName?: string;
  superAdminEmail?: string;
  superAdminPassword?: string;
  adminPhone?: string;
  designation?: string;
  autoDeactivateDate?: string | null;
};

function setError(errors: ValidationErrorMap, key: string, message: string) {
  if (!errors[key]) {
    errors[key] = message;
  }
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  const digits = normalizeDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

function isValidPostalCode(value: string) {
  const normalized = value.trim();
  return normalized.length === 0 || /^[A-Za-z0-9 -]{4,10}$/.test(normalized);
}

function isValidPan(value: string) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.trim().toUpperCase());
}

function isValidTan(value: string) {
  return /^[A-Z]{4}[0-9]{5}[A-Z]$/.test(value.trim().toUpperCase());
}

function isValidAadhaar(value: string) {
  const digits = normalizeDigits(value);
  return digits.length === 12 && !/^(\d)\1{11}$/.test(digits);
}

function isPastDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return value < `${year}-${month}-${day}`;
}

function normalizeDomainInput(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

export function validateSetupStepOne(input: OrganizationSetupValidationInput) {
  const errors: ValidationErrorMap = {};
  const organizationName = input.organizationName?.trim() ?? "";
  const organizationEmail = input.organizationEmail?.trim().toLowerCase() ?? "";
  const phoneNumber = input.phoneNumber?.trim() ?? "";
  const industry = input.industry?.trim() ?? "";
  const setupProfile = input.setupProfile;
  const systemDomain = buildSystemDomain(input.systemDomain ?? "");
  const customDomain = normalizeCustomDomain(input.customDomain);
  const superAdminName = input.superAdminName?.trim() ?? "";
  const superAdminEmail = input.superAdminEmail?.trim().toLowerCase() ?? "";
  const superAdminPassword = input.superAdminPassword ?? "";
  const adminPhone = input.adminPhone?.trim() ?? "";
  const designation = input.designation?.trim() ?? "";
  const autoDeactivateDate = input.autoDeactivateDate?.trim() ?? "";

  if (!organizationName || organizationName.length < 3) {
    setError(errors, "organizationName", "Organization name is required.");
  }
  if (!organizationEmail || !isValidEmail(organizationEmail)) {
    setError(errors, "organizationEmail", "Enter a valid organization email.");
  }
  if (!phoneNumber || !isValidPhone(phoneNumber)) {
    setError(errors, "phoneNumber", "Enter a valid phone number.");
  }
  if (!industry) {
    setError(errors, "industry", "Select an industry.");
  }
  if (!setupProfile?.streetAddress?.trim()) {
    setError(errors, "streetAddress", "Street address is required.");
  }
  if (setupProfile?.city && setupProfile.city.trim().length < 2) {
    setError(errors, "city", "City should contain at least 2 characters.");
  }
  if (setupProfile?.stateRegion && setupProfile.stateRegion.trim().length < 2) {
    setError(errors, "stateRegion", "State or region should contain at least 2 characters.");
  }
  if (setupProfile?.postalCode && !isValidPostalCode(setupProfile.postalCode)) {
    setError(errors, "postalCode", "Enter a valid postal code.");
  }
  if (setupProfile?.website?.trim()) {
    try {
      const normalizedWebsite = normalizeDomainInput(setupProfile.website);
      new URL(normalizedWebsite.startsWith("http") ? normalizedWebsite : `https://${normalizedWebsite}`);
    } catch {
      setError(errors, "website", "Enter a valid website URL.");
    }
  }
  if (!systemDomain && !customDomain) {
    setError(errors, "domainType", "Select a system or custom domain.");
  }
  if (systemDomain && !systemDomain.endsWith(SYSTEM_DOMAIN_SUFFIX)) {
    setError(
      errors,
      "systemDomainName",
      `System domain must end with ${SYSTEM_DOMAIN_SUFFIX}.`,
    );
  }
  if (customDomain && customDomain === systemDomain) {
    setError(errors, "customDomain", "Custom domain must be different from system domain.");
  }
  if (!customDomain && !systemDomain) {
    setError(errors, "customDomain", "Enter a valid domain.");
  }
  if (!superAdminName) {
    setError(errors, "superAdminName", "Admin name is required.");
  }
  if (!superAdminEmail || !isValidEmail(superAdminEmail)) {
    setError(errors, "superAdminEmail", "Enter a valid admin email.");
  }
  if (!input.isEditMode && superAdminPassword.length < 8) {
    setError(errors, "superAdminPassword", "Password must be at least 8 characters.");
  }
  if (!adminPhone || !isValidPhone(adminPhone)) {
    setError(errors, "adminPhone", "Enter a valid admin phone number.");
  }
  if (!designation) {
    setError(errors, "designation", "Designation is required.");
  }
  if (autoDeactivateDate && isPastDateInput(autoDeactivateDate)) {
    setError(errors, "autoDeactivateDate", "Subscription end date cannot be before today.");
  }
  if (setupProfile?.panNumber?.trim() && !isValidPan(setupProfile.panNumber)) {
    setError(errors, "panNumber", "Enter a valid PAN in AAAAA9999A format.");
  }
  if (setupProfile?.tanNumber?.trim() && !isValidTan(setupProfile.tanNumber)) {
    setError(errors, "tanNumber", "Enter a valid TAN in AAAA99999A format.");
  }
  if (setupProfile?.pfAccountNumber?.trim() && setupProfile.pfAccountNumber.trim().length < 5) {
    setError(errors, "pfAccountNumber", "PF account number is too short.");
  }
  if (setupProfile?.aadhaarNumber?.trim() && !isValidAadhaar(setupProfile.aadhaarNumber)) {
    setError(errors, "aadhaarNumber", "Enter a valid Aadhaar number.");
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAttributeLabel(label: string) {
  const errors: ValidationErrorMap = {};
  if (!label.trim()) {
    setError(errors, "attributeLabel", "Attribute name is required.");
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAttributeUnitDraft(input: { code: string; description: string }) {
  const errors: ValidationErrorMap = {};
  if (!input.code.trim()) {
    setError(errors, "unitCode", "Unit code is required.");
  }
  if (!input.description.trim()) {
    setError(errors, "unitDescription", "Unit description is required.");
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateBranchOfficeDraft(input: {
  name: string;
  location: string;
  subLocation: string;
}) {
  const errors: ValidationErrorMap = {};
  if (!input.name.trim()) {
    setError(errors, "branchName", "Branch name is required.");
  }
  if (!input.location.trim()) {
    setError(errors, "branchLocation", "Main location is required.");
  }
  if (!input.subLocation.trim()) {
    setError(errors, "branchSubLocation", "Sub location is required.");
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePacketAssignmentDraft(input: {
  positionCode: string;
  attributeIds: string[];
}) {
  const errors: ValidationErrorMap = {};
  if (!input.positionCode.trim()) {
    setError(errors, "positionCode", "Position code is required.");
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateGroupDefinitionDraft(input: {
  fields: Array<{ key: string; label: string; type: "text" | "number" | "select"; min?: number }>;
  values: Record<string, string>;
  attributeIds: string[];
}) {
  const errors: ValidationErrorMap = {};

  if (input.attributeIds.length === 0) {
    setError(errors, "groupAttributes", "Select at least one attribute.");
  }

  input.fields.forEach((field) => {
    const value = (input.values[field.key] ?? "").trim();
    if (!value) {
      setError(errors, `moduleField:${field.key}`, `${field.label} is required.`);
      return;
    }

    if (field.type === "number") {
      const parsedValue = Number(value);
      if (Number.isNaN(parsedValue) || parsedValue < (field.min ?? 0)) {
        setError(errors, `moduleField:${field.key}`, `${field.label} must be a valid number.`);
      }
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateOrganizationAttributeSetupDraft(input: OrganizationAttributeSetup) {
  const errors: ValidationErrorMap = {};

  input.selectedIds.forEach((attributeId) => {
    const hasAttribute =
      [...input.financial, ...input.geographical, ...input.roleBased].some(
        (attribute) => attribute.id === attributeId,
      );
    if (!hasAttribute) {
      setError(errors, "selectedIds", "Selected attributes contain invalid entries.");
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateOrganizationPacketSetupDraft(
  input: OrganizationPacketSetup,
  selectedAttributeIds: string[],
) {
  const errors: ValidationErrorMap = {};

  Object.entries(input.assignmentsByItemId).forEach(([itemId, assignments]) => {
    assignments.forEach((assignment, index) => {
      if (!assignment.positionCode.trim()) {
        setError(errors, `packet:${itemId}:${index}:positionCode`, "Position code is required.");
      }
      const hasUnknownAttribute = assignment.attributeIds.some(
        (attributeId) => !selectedAttributeIds.includes(attributeId),
      );
      if (hasUnknownAttribute) {
        setError(
          errors,
          `packet:${itemId}:${index}:attributeIds`,
          "Packet attributes must come from selected attributes.",
        );
      }
    });
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateOrganizationGroupDefinitionSetupDraft(
  input: OrganizationGroupDefinitionSetup,
  selectedAttributeIds: string[],
) {
  const errors: ValidationErrorMap = {};

  Object.entries(input.rulesByModuleId).forEach(([moduleId, rules]) => {
    rules.forEach((rule, index) => {
      if (rule.attributeIds.length === 0) {
        setError(errors, `group:${moduleId}:${index}:attributeIds`, "Select at least one attribute.");
      }
      const hasUnknownAttribute = rule.attributeIds.some(
        (attributeId) => !selectedAttributeIds.includes(attributeId),
      );
      if (hasUnknownAttribute) {
        setError(
          errors,
          `group:${moduleId}:${index}:attributeIds`,
          "Group definition attributes must come from selected attributes.",
        );
      }
    });
  });

  return { valid: Object.keys(errors).length === 0, errors };
}
