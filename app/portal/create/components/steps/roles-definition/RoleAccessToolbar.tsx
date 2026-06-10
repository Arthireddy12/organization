import { LayoutGrid, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";

type RoleAccessToolbarProps = {
  disabled: boolean;
  loading: boolean;
  organizationReady: boolean;
  searchQuery: string;
  subjectCount: number;
  onOpenModuleAccess: () => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
};

export default function RoleAccessToolbar({
  disabled,
  loading,
  organizationReady,
  searchQuery,
  subjectCount,
  onOpenModuleAccess,
  onRefresh,
  onSearchChange,
}: RoleAccessToolbarProps) {
  return (
    <div className="max-w-full overflow-hidden rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Button
          type="button"
          variant="primary"
          className="rounded-sm px-5"
          onClick={onOpenModuleAccess}
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Configure Module Access
        </Button>

          <div className="min-w-0 w-full lg:w-72">
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search employee or email"
            icon={<Search className="h-4 w-4" />}
          />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-sm"
            onClick={onRefresh}
            disabled={disabled || !organizationReady || loading}
            aria-label="Refresh organization employees"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="truncate">{subjectCount} access rows available</span>
        </div>
      </div>
    </div>
  );
}
