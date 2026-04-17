import { getSessionFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateOrganizationForm from "./CreateOrganizationForm";

export default async function CreateOrganizationPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return <CreateOrganizationForm />;
}
