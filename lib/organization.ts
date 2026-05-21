import { prisma } from "@/lib/prisma";

export const moduleOptions = [
  "Dashboard",
  "Leave Policy Control",
  "Payroll Policy Engine",
  "Projects",
  "HR Payroll Portal",
  "Projects Review",
  "Leave Intelligence",
  "Employees",
  "Candidates",
  "Recruitment / Jobs",
  "Onboarding",
  "Letters",
  "Documents",
  "Attendance",
  "Analytics",
  "Shifts",
  "Policies",
  "Leaves",
  "Comp Off Requests",
  "Auto Escalation",
  "Backup Approver",
  "Delegation",
  "Approval Routing",
  "Holidays",
  "Departments",
  "Org Chart",
  "Settings",
] as const;

export type ModuleAccessObject = Record<string, boolean>;

export function normalizeModuleAccessToArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (module): module is string =>
        typeof module === "string" && moduleOptions.includes(module as typeof moduleOptions[number]),
    );
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).reduce<string[]>((modules, [key, value]) => {
      if (moduleOptions.includes(key as typeof moduleOptions[number]) && value === true) {
        modules.push(key);
      }
      return modules;
    }, []);
  }

  return [];
}

export function normalizeModuleAccessToObject(value: unknown): ModuleAccessObject {
  const normalized: ModuleAccessObject = {};

  if (Array.isArray(value)) {
    value
      .filter((module): module is string =>
        typeof module === "string" && moduleOptions.includes(module as typeof moduleOptions[number]),
      )
      .forEach((moduleName) => {
        normalized[moduleName] = true;
      });
    return normalized;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, moduleValue]) => {
      if (moduleOptions.includes(key as typeof moduleOptions[number])) {
        normalized[key] = moduleValue === true;
      }
    });
    return normalized;
  }

  return normalized;
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
