import { Button } from "@better-t-app/ui/components/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { getPaginationItems } from "@/utils/pagination";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="ページネーション" className="mt-10 flex items-center justify-center gap-1" style={{ fontFamily: "Manrope" }}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">前へ</span>
      </Button>

      <div className="flex items-center gap-1" aria-label={`全${totalPages}ページ中${page}ページ目`}>
        {getPaginationItems(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 px-0"
              aria-current={item === page ? "page" : undefined}
              aria-label={`${item}ページ目`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <span className="hidden sm:inline">次へ</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
