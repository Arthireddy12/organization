import { backfillOrganizationSlugs } from "@/app/repositories/organization";

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
