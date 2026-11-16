import type { ReactNode } from "react";
import { cx } from "./ui";

export function ActionFooter({
  left,
  center,
  right,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right: ReactNode;
}) {
  return (
    <footer className="sticky bottom-0 z-20 mt-auto w-full shrink-0 border-t border-brio-subtle bg-brio-surface">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 @min-[48rem]:grid @min-[48rem]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-wrap items-center gap-2">{left}</div>
        <div className="-order-1 w-full text-xs text-brio-muted empty:hidden @min-[48rem]:order-none @min-[48rem]:col-start-2 @min-[48rem]:w-auto @min-[48rem]:text-center">
          {center}
        </div>
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 @min-[48rem]:col-start-3">
          {right}
        </div>
      </div>
    </footer>
  );
}

export function FormSection({
  title,
  description,
  flush = false,
  children,
}: {
  title: string;
  description?: string;
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-brio-panel border border-brio-subtle bg-brio-surface">
      <div className={cx("px-5 pt-5 pb-4", flush && "border-b border-brio-subtle")}>
        <h2 className="text-base font-semibold text-brio-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-brio-muted">{description}</p>}
      </div>
      <div className={cx("min-w-0", !flush && "px-5 pb-5")}>{children}</div>
    </section>
  );
}
