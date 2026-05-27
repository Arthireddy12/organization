import { prisma } from "@/lib/prisma";

const moduleGroups = [
  { name: "Dashboard", modules: [] },
  {
    name: "Payroll Module",
    modules: ["Payroll Policy Engine", "Payroll Generation"],
  },
  { name: "Settings", modules: [] },
  { name: "Support", modules: ["Performance and Goals"] },
  {
    name: "Recruitment Module",
    modules: ["Candidates", "Recruitment / Jobs"],
  },
  {
    name: "Attendance Module",
    modules: ["Attendance", "Analytics"],
  },
  { name: "Goals Management", modules: ["Goals"] },
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
  const groupedAccess = normalizeGroupedModuleAccess(value);
  if (groupedAccess) {
    return groupedAccess.groups.reduce<string[]>((modules, group) => {
      if (group.enabled) modules.push(group.name);
      group.modules.forEach((module) => {
        if (module.enabled) modules.push(module.name);
      });
      return modules;
    }, []);
  }

  if (Array.isArray(value)) {
    return value.filter(
      (module): module is string => typeof module === "string" && isAllowedModule(module),
    );
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).reduce<string[]>((modules, [key, value]) => {
      if (isAllowedModule(key) && value === true) {
        modules.push(key);
      }
      return modules;
    }, []);
  }

  return [];
}

export function normalizeModuleAccessToObject(value: unknown): ModuleAccessObject {
  const groupedAccess = normalizeGroupedModuleAccess(value);
  if (groupedAccess) return groupedAccess;

  if (Array.isArray(value)) {
    const enabledModules = new Set(
      value.filter((module): module is string => typeof module === "string" && isAllowedModule(module)),
    );
    return moduleAccessObjectFromEnabledNames(enabledModules);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const enabledModules = Object.entries(value).reduce<Set<string>>((modules, [key, moduleValue]) => {
      if (isAllowedModule(key) && moduleValue === true) {
        modules.add(key);
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
    await prisma.$runCommandRaw({
      update: "Organization",
      updates: [
        {
          q: {
            $or: [{ slug: null }, { slug: { $exists: false } }, { slug: "" }],
          },
          u: [
            {
              $set: {
                slug: {
                  $concat: ["org-", { $toString: "$_id" }],
                },
              },
            },
          ],
          multi: true,
        },
      ],
    });
  } catch {
    // Ignore failures here; regular Prisma queries will surface real errors.
  }
}
