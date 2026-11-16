import type { ComponentPropsWithoutRef } from "react";
import { cx } from "./ui";

export function RecordsTable({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return <table {...props} className={cx("data-table records-table", className)} />;
}
