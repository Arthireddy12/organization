import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  summary?: string;
};

export function Pagination({
  page,
  pageCount,
  onPageChange,
  summary,
}: PaginationProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < pageCount;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
      <p className="text-xs text-slate-500">
        {summary ?? (
          <>
            Page <span className="font-semibold text-slate-800">{page}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">{pageCount}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Previous page"
          disabled={!canGoPrevious}
          onClick={() => onPageChange?.(page - 1)}
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="grid h-8 min-w-8 place-items-center rounded-lg border border-blue-100 bg-blue-50 px-2 text-xs font-bold text-blue-600">
          {page}
        </span>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Next page"
          disabled={!canGoNext}
          onClick={() => onPageChange?.(page + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
