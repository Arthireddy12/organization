export type OrganizationRoleAccessSetup = {
  accessBySubjectKey: Record<string, Record<string, boolean>>;
};

export const defaultOrganizationRoleAccessSetup: OrganizationRoleAccessSetup = {
  accessBySubjectKey: {},
};

export function normalizeOrganizationRoleAccessSetup(
  value: unknown,
): OrganizationRoleAccessSetup {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultOrganizationRoleAccessSetup };
  }

  const setup = value as Partial<OrganizationRoleAccessSetup>;
  const accessBySubjectKey =
    setup.accessBySubjectKey && typeof setup.accessBySubjectKey === "object"
      ? Object.entries(setup.accessBySubjectKey).reduce<
          Record<string, Record<string, boolean>>
        >((result, [subjectKey, access]) => {
          if (!access || typeof access !== "object" || Array.isArray(access)) {
            return result;
          }

          result[subjectKey] = Object.entries(access).reduce<Record<string, boolean>>(
            (items, [moduleName, enabled]) => {
              items[moduleName] = enabled === true;
              return items;
            },
            {},
          );
          return result;
        }, {})
      : {};

  return {
    accessBySubjectKey,
  };
}
