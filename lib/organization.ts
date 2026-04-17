import { prisma } from "@/lib/prisma";

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
