import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Select, cx } from "./ui";

export function TablePagination({
  label,
  noun,
  plural = noun + "s",
  total,
  page,
  pageSize,
  onPageChange,
  pageSizes,
  autoPageSize,
  showPageNumbers = false,
  onPageSizeChange,
}: {
  label: string;
  noun: string;
  plural?: string;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  pageSizes?: readonly number[];
  autoPageSize?: boolean;
  showPageNumbers?: boolean;
  onPageSizeChange?: (size: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const visiblePageCount = Math.min(pages, 5);
  const firstVisiblePage = Math.max(1, Math.min(page - 2, pages - visiblePageCount + 1));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const range = start === end ? String(start) : start + "–" + end;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 shrink-0 border-t border-brio-subtle px-5 py-3">
      <p role="status" className="text-sm text-brio-muted tabular-nums">
        {total ? range + " of " + total + " " : "0 "}
        {total === 1 ? noun : plural}
      </p>
      {(pages > 1 || (total > 0 && pageSizes)) && (
        <nav
          aria-label={label}
          className={cx(
            "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2",
            showPageNumbers && "flex-1 basis-64 justify-between",
          )}
        >
          {pageSizes && onPageSizeChange && (
            <label className="flex items-center gap-2 text-xs text-brio-muted">
              Rows per page
              <Select
                className="w-20"
                value={autoPageSize ? 0 : pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
              >
                {autoPageSize !== undefined && <option value={0}>Auto</option>}
                {pageSizes.map((size) => (
                  <option value={size} key={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </label>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="w-8 px-0"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft aria-hidden className="size-4" />
            </Button>
            {showPageNumbers ? (
              Array.from({ length: visiblePageCount }, (_, i) => firstVisiblePage + i).map(
                (number) => (
                  <Button
                    key={number}
                    size="sm"
                    variant={page === number ? "primary" : "secondary"}
                    className="w-8 px-0 tabular-nums"
                    aria-current={page === number ? "page" : undefined}
                    aria-label={"Page " + number}
                    onClick={() => onPageChange(number)}
                  >
                    {number}
                  </Button>
                ),
              )
            ) : (
              <span className="px-1 text-xs text-brio-muted tabular-nums">
                Page {page} of {pages}
              </span>
            )}
            <Button
              size="sm"
              className="w-8 px-0"
              aria-label="Next page"
              disabled={page === pages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight aria-hidden className="size-4" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
