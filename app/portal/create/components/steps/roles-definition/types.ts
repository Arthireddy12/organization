export type RoleAccessSubject = {
  key: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
};

export type OrganizationUserListItem = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};
