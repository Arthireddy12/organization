import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { Panel, PanelHeader } from "@/components/common/panel";

export default async function BillingPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="px-6 pb-10 pt-5 lg:px-8">
      <div className="mb-5 border-b border-slate-200 pb-5">
        <h2 className="text-lg font-bold text-slate-950">Billing</h2>
        <p className="mt-1 text-sm text-slate-500">
          Subscription and invoice controls can be managed here.
        </p>
      </div>
      <Panel>
        <PanelHeader>
          <h3 className="font-bold text-slate-950">Billing Overview</h3>
        </PanelHeader>
        <div className="p-5 text-sm text-slate-500">
          Billing setup is ready for your next workflow.
        </div>
      </Panel>
    </div>
  );
}
