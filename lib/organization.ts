import { backfillOrganizationSlugs } from "@/app/repositories/organization";

const moduleGroups = [
  { name: "Dashboard", modules: [] },
  {
    name: "Payroll Module",
    modules: ["Payroll Policy Engine", "Payroll Generation"],
  },
  { name: "Settings", modules: [] },
  { name: "Support", modules: ["Helpdesk", "Performance & Goals"] },
  {
    name: "Recruitment Module",
    modules: ["Candidates", "Recruitment / Jobs"],
  },
  {
    name: "Attendance Module",
    modules: ["Attendance", "Analytics"],
  },
  {
    name: "Leave Module",
    modules: [
      "Leave Policy Control",
      "Policies",
      "Leaves",
      "Comp Off Requests",
      "Auto Escalation",
      "Backup Approver",
      "Delegation",
      "Holidays",
    ],
  },
  {
    name: "People Module",
    modules: [
      "All Employees",
      "Onboarding",
      "Letters",
      "Documents",
      "Shifts",
      "All Departments",
      "Org Chart",
      "Directory",
    ],
  },
] as const;

const legacyModuleOptions = [
  "Performance",
  "Goals",
  "Goals Management",
  "Projects",
  "HR Payroll Portal",
  "Projects Review",
  "Leave Intelligence",
  "Employees",
  "Approval Routing",
  "Departments",
] as const;

export const moduleOptions = [
  ...moduleGroups.flatMap((group) => [group.name, ...group.modules]),
  ...legacyModuleOptions,
] as const;

type ModuleAccessGroup = {
  name: string;
  enabled: boolean;
  modules: {
    name: string;
    enabled: boolean;
  }[];
};

export type ModuleAccessObject = {
  groups: ModuleAccessGroup[];
};

function isAllowedModule(moduleName: string) {
  return moduleOptions.includes(moduleName as typeof moduleOptions[number]);
}

function getCanonicalModuleName(moduleName: string) {
  if (
    moduleName === "Performance" ||
    moduleName === "Goals" ||
    moduleName === "Goals Management"
  ) {
    return "Performance & Goals";
  }

  return moduleName;
}

function normalizeGroupedModuleAccess(value: unknown): ModuleAccessObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || !("groups" in value)) {
    return null;
  }

  const groups = (value as { groups?: unknown }).groups;
  if (!Array.isArray(groups)) return null;

  return {
    groups: groups.reduce<ModuleAccessGroup[]>((normalizedGroups, group) => {
      if (!group || typeof group !== "object" || Array.isArray(group)) return normalizedGroups;

      const groupRecord = group as {
        name?: unknown;
        enabled?: unknown;
        modules?: unknown;
      };

      if (typeof groupRecord.name !== "string" || !isAllowedModule(groupRecord.name)) {
        return normalizedGroups;
      }

      normalizedGroups.push({
        name: groupRecord.name,
        enabled: groupRecord.enabled === true,
        modules: Array.isArray(groupRecord.modules)
          ? groupRecord.modules.reduce<ModuleAccessGroup["modules"]>((modules, module) => {
              if (!module || typeof module !== "object" || Array.isArray(module)) return modules;

              const moduleRecord = module as { name?: unknown; enabled?: unknown };
              if (typeof moduleRecord.name === "string" && isAllowedModule(moduleRecord.name)) {
                modules.push({
                  name: moduleRecord.name,
                  enabled: moduleRecord.enabled === true,
                });
              }

              return modules;
            }, [])
          : [],
      });

      return normalizedGroups;
    }, []),
  };
}

function moduleAccessObjectFromEnabledNames(enabledModules: Set<string>): ModuleAccessObject {
  return {
    groups: moduleGroups.map((group) => ({
      name: group.name,
      enabled: enabledModules.has(group.name),
      modules: group.modules.map((moduleName) => ({
        name: moduleName,
        enabled: enabledModules.has(moduleName),
      })),
    })),
  };
}

/*
 * Old data was stored as a flat object of booleans. New data is stored in the
 * same grouped shape the UI shows, while reads can still flatten either format.
 */
export function normalizeModuleAccessToArray(value: unknown): string[] {
  const normalizedModules = new Set<string>();
  const groupedAccess = normalizeGroupedModuleAccess(value);
  if (groupedAccess) {
    groupedAccess.groups.forEach((group) => {
      if (group.enabled) normalizedModules.add(getCanonicalModuleName(group.name));
      group.modules.forEach((module) => {
        if (module.enabled) normalizedModules.add(getCanonicalModuleName(module.name));
      });
    });
    return Array.from(normalizedModules);
  }

  if (Array.isArray(value)) {
    value.forEach((module) => {
      if (typeof module === "string" && isAllowedModule(module)) {
        normalizedModules.add(getCanonicalModuleName(module));
      }
    });
    return Array.from(normalizedModules);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, value]) => {
      if (isAllowedModule(key) && value === true) {
        normalizedModules.add(getCanonicalModuleName(key));
      }
    });
    return Array.from(normalizedModules);
  }

  return [];
}

export function normalizeModuleAccessToObject(value: unknown): ModuleAccessObject {
  const groupedAccess = normalizeGroupedModuleAccess(value);
  if (groupedAccess) {
    return moduleAccessObjectFromEnabledNames(new Set(normalizeModuleAccessToArray(value)));
  }

  if (Array.isArray(value)) {
    const enabledModules = new Set(
      value
        .filter((module): module is string => typeof module === "string" && isAllowedModule(module))
        .map(getCanonicalModuleName),
    );
    return moduleAccessObjectFromEnabledNames(enabledModules);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const enabledModules = Object.entries(value).reduce<Set<string>>((modules, [key, moduleValue]) => {
      if (isAllowedModule(key) && moduleValue === true) {
        modules.add(getCanonicalModuleName(key));
      }
      return modules;
    }, new Set<string>());

    return moduleAccessObjectFromEnabledNames(enabledModules);
  }

  return moduleAccessObjectFromEnabledNames(new Set());
}

let backfillAttempted = false;

export async function ensureOrganizationSlugs() {
  if (backfillAttempted) return;
  backfillAttempted = true;

  try {
    // Backfill legacy organizations that were created before slug was introduced.
    await backfillOrganizationSlugs();
  } catch {
    // Ignore failures here; regular database queries will surface real errors.
  }
}
