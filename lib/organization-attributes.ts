export type AttributeCategory = "financial" | "geographical" | "roleBased";

export type OrganizationAttribute = {
  id: string;
  label: string;
  category: AttributeCategory;
  isCustom?: boolean;
};

export type AttributeUnit = {
  id: string;
  code: string;
  description: string;
};

export type OrganizationAttributeSetup = {
  financial: OrganizationAttribute[];
  geographical: OrganizationAttribute[];
  roleBased: OrganizationAttribute[];
  selectedIds: string[];
  unitsByAttributeId: Record<string, AttributeUnit[]>;
};

function createAttribute(category: AttributeCategory, label: string, isCustom = false) {
  return {
    id: `${category}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
    label,
    category,
    isCustom,
  };
}

export const defaultOrganizationAttributeSetup: OrganizationAttributeSetup = {
  financial: [
    createAttribute("financial", "Business"),
    createAttribute("financial", "Channel"),
    createAttribute("financial", "Company"),
    createAttribute("financial", "Cost Center"),
    createAttribute("financial", "Cost Code"),
    createAttribute("financial", "Customer"),
    createAttribute("financial", "Group"),
    createAttribute("financial", "Legal Entity"),
  ],
  geographical: [
    createAttribute("geographical", "Area"),
    createAttribute("geographical", "Branch"),
    createAttribute("geographical", "City"),
    createAttribute("geographical", "Division"),
    createAttribute("geographical", "Location"),
    createAttribute("geographical", "Nation"),
    createAttribute("geographical", "Region"),
    createAttribute("geographical", "State"),
    createAttribute("geographical", "Store"),
    createAttribute("geographical", "Zone"),
  ],
  roleBased: [
    createAttribute("roleBased", "Company Code"),
    createAttribute("roleBased", "Organization Level"),
    createAttribute("roleBased", "Grade"),
    createAttribute("roleBased", "Designation"),
    createAttribute("roleBased", "Department"),
    createAttribute("roleBased", "Employee Type"),
  ],
  selectedIds: [],
  unitsByAttributeId: {},
};

function normalizeAttributeCategory(value: unknown): AttributeCategory | null {
  return value === "financial" || value === "geographical" || value === "roleBased"
    ? value
    : null;
}

function normalizeAttributes(
  value: unknown,
  fallback: OrganizationAttribute[],
  category: AttributeCategory,
) {
  if (!Array.isArray(value)) return fallback;

  return value.reduce<OrganizationAttribute[]>((attributes, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return attributes;

    const record = item as Partial<OrganizationAttribute>;
    const label = typeof record.label === "string" ? record.label.trim() : "";
    if (!label) return attributes;

    attributes.push({
      id:
        typeof record.id === "string" && record.id.trim()
          ? record.id
          : `${category}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label,
      category: normalizeAttributeCategory(record.category) ?? category,
      isCustom: record.isCustom === true,
    });
    return attributes;
  }, []);
}

export function normalizeOrganizationAttributeSetup(
  value: unknown,
): OrganizationAttributeSetup {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return structuredClone(defaultOrganizationAttributeSetup);
  }

  const setup = value as Partial<OrganizationAttributeSetup>;
  const financial = normalizeAttributes(
    setup.financial,
    defaultOrganizationAttributeSetup.financial,
    "financial",
  );
  const geographical = normalizeAttributes(
    setup.geographical,
    defaultOrganizationAttributeSetup.geographical,
    "geographical",
  );
  const roleBased = normalizeAttributes(
    setup.roleBased,
    defaultOrganizationAttributeSetup.roleBased,
    "roleBased",
  );
  const allIds = new Set([...financial, ...geographical, ...roleBased].map((item) => item.id));
  const selectedIds = Array.isArray(setup.selectedIds)
    ? setup.selectedIds.filter((id): id is string => typeof id === "string" && allIds.has(id))
    : [];
  const unitsByAttributeId =
    setup.unitsByAttributeId && typeof setup.unitsByAttributeId === "object"
      ? Object.entries(setup.unitsByAttributeId).reduce<Record<string, AttributeUnit[]>>(
          (unitsMap, [attributeId, units]) => {
            if (!allIds.has(attributeId) || !Array.isArray(units)) return unitsMap;
            unitsMap[attributeId] = units.reduce<AttributeUnit[]>((items, unit, index) => {
              if (!unit || typeof unit !== "object" || Array.isArray(unit)) return items;
              const record = unit as Partial<AttributeUnit>;
              const code = typeof record.code === "string" ? record.code.trim() : "";
              const description =
                typeof record.description === "string" ? record.description.trim() : "";
              if (!code && !description) return items;
              items.push({
                id:
                  typeof record.id === "string" && record.id.trim()
                    ? record.id
                    : `${attributeId}-unit-${index + 1}`,
                code,
                description,
              });
              return items;
            }, []);
            return unitsMap;
          },
          {},
        )
      : {};

  return {
    financial,
    geographical,
    roleBased,
    selectedIds,
    unitsByAttributeId,
  };
}

export function findAttributeById(
  setup: OrganizationAttributeSetup,
  attributeId: string,
) {
  return [...setup.financial, ...setup.geographical, ...setup.roleBased].find(
    (attribute) => attribute.id === attributeId,
  );
}

export function getAttributeUnits(
  setup: OrganizationAttributeSetup,
  attributeId: string,
) {
  return setup.unitsByAttributeId[attributeId] ?? [];
}
