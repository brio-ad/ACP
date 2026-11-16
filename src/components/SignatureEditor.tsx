import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Braces,
  ChevronDown,
  Code2,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Type,
  Underline,
  Undo2,
  Eye,
} from "lucide-react";
import { BLOCKS, VARIABLES } from "../data";
import { Button, Input, Segmented, cx } from "./ui";

const FONTS = [
  { label: "Sans Serif", value: "Arial, Helvetica, sans-serif" },
  { label: "Serif", value: "'Times New Roman', serif" },
  { label: "Fixed Width", value: "'Courier New', monospace" },
  { label: "Wide", value: "'Arial Black', sans-serif" },
  { label: "Narrow", value: "'Arial Narrow', sans-serif" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];
const SIZES = [
  { label: "Small", value: "1", px: 11 },
  { label: "Normal", value: "2", px: 13 },
  { label: "Large", value: "4", px: 17 },
  { label: "Huge", value: "6", px: 24 },
];
const COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#cccccc",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#1d3fd1",
  "#0f172a",
  "#334155",
  "#64748b",
  "#16a34a",
  "#b45309",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
];

type Mode = "visual" | "html";

export function SignatureEditor({
  html,
  onChange,
}: {
  html: string;
  onChange: (html: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("visual");
  const surface = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const range = useRef<Range | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Only write innerHTML when the change came from outside the surface, so the caret is preserved while typing.
  useEffect(() => {
    const el = surface.current;
    if (mode === "visual" && el && el.innerHTML !== html) el.innerHTML = html;
  }, [html, mode]);

  useEffect(() => {
    const onSel = () => {
      const sel = document.getSelection();
      if (!sel || sel.rangeCount === 0 || !surface.current) return;
      const r = sel.getRangeAt(0);
      if (!surface.current.contains(r.commonAncestorContainer)) return;
      range.current = r.cloneRange();
      const s: Record<string, boolean> = {};
      for (const c of [
        "bold",
        "italic",
        "underline",
        "strikeThrough",
        "insertOrderedList",
        "insertUnorderedList",
        "justifyCenter",
        "justifyRight",
      ]) {
        try {
          s[c] = document.queryCommandState(c);
        } catch {
          s[c] = false;
        }
      }
      setActive(s);
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const emit = useCallback(() => {
    if (surface.current) onChange(surface.current.innerHTML);
  }, [onChange]);

  const restore = () => {
    const el = surface.current;
    if (!el) return;
    el.focus();
    const sel = document.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    if (range.current) sel.addRange(range.current);
    else {
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      sel.addRange(r);
    }
  };

  const exec = (cmd: string, value?: string, css = false) => {
    restore();
    document.execCommand("styleWithCSS", false, css ? "true" : "false");
    document.execCommand(cmd, false, value);
    emit();
  };

  const insert = (snippet: string) => {
    if (mode === "html") {
      const ta = textarea.current;
      const start = ta?.selectionStart ?? html.length;
      const end = ta?.selectionEnd ?? html.length;
      onChange(html.slice(0, start) + snippet + html.slice(end));
      requestAnimationFrame(() => {
        ta?.focus();
        ta?.setSelectionRange(start + snippet.length, start + snippet.length);
      });
      return;
    }
    exec("insertHTML", snippet);
  };

  const keep = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-brio-surface">
      <div className="relative flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-brio-subtle px-4 py-3">
        <Segmented
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            {
              value: "visual",
              label: (
                <>
                  <Eye className="size-3.5" /> Visual
                </>
              ),
            },
            {
              value: "html",
              label: (
                <>
                  <Code2 className="size-3.5" /> HTML
                </>
              ),
            },
          ]}
        />
        <div className="flex items-center gap-1">
          <BlockMenu onPick={(h) => insert(h)} />
        </div>
      </div>

      {mode === "visual" && (
        <div
          className="relative flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/60 px-2 py-1.5"
          onMouseDown={keep}
        >
          <Tool label="Undo" onClick={() => exec("undo")}>
            <Undo2 />
          </Tool>
          <Tool label="Redo" onClick={() => exec("redo")}>
            <Redo2 />
          </Tool>
          <Sep />
          <Dropdown
            label="Font"
            trigger={
              <span className="flex w-24 items-center justify-between text-[13px] text-slate-700">
                Sans Serif <ChevronDown className="size-3.5" />
              </span>
            }
          >
            {(close) =>
              FONTS.map((f) => (
                <MenuItem
                  key={f.label}
                  onClick={() => {
                    exec("fontName", f.value);
                    close();
                  }}
                >
                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                </MenuItem>
              ))
            }
          </Dropdown>
          <Sep />
          <Dropdown
            label="Size"
            trigger={
              <span className="flex items-center gap-0.5">
                <Type className="size-4" />
                <ChevronDown className="size-3" />
              </span>
            }
          >
            {(close) =>
              SIZES.map((s) => (
                <MenuItem
                  key={s.value}
                  onClick={() => {
                    exec("fontSize", s.value);
                    close();
                  }}
                >
                  <span style={{ fontSize: s.px }}>{s.label}</span>
                </MenuItem>
              ))
            }
          </Dropdown>
          <Sep />
          <Tool label="Bold" active={active.bold} onClick={() => exec("bold")}>
            <Bold />
          </Tool>
          <Tool label="Italic" active={active.italic} onClick={() => exec("italic")}>
            <Italic />
          </Tool>
          <Tool label="Underline" active={active.underline} onClick={() => exec("underline")}>
            <Underline />
          </Tool>
          <Tool
            label="Strikethrough"
            active={active.strikeThrough}
            onClick={() => exec("strikeThrough")}
          >
            <Strikethrough />
          </Tool>
          <Dropdown
            label="Text color"
            trigger={
              <span className="flex items-center gap-0.5">
                <Baseline className="size-4" />
                <ChevronDown className="size-3" />
              </span>
            }
          >
            {(close) => (
              <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2">
                {(["Text color", "Background color"] as const).map((title) => (
                  <div key={title}>
                    <p className="mb-1.5 text-[11px] font-medium text-slate-500">{title}</p>
                    <div className="grid grid-cols-8 gap-1">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`${title} ${c}`}
                          onMouseDown={keep}
                          onClick={() => {
                            exec(title === "Text color" ? "foreColor" : "hiliteColor", c, true);
                            close();
                          }}
                          className="size-4.5 rounded-sm ring-1 ring-slate-200 transition-transform hover:scale-125"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Dropdown>
          <Sep />
          <PromptTool
            label="Insert link"
            icon={<Link2 />}
            fields={["Text to display", "URL or {{email}}"]}
            onSubmit={([text, url]) => {
              const href = /^(https?:|mailto:|tel:|\{\{)/.test(url) ? url : `https://${url}`;
              exec("insertHTML", `<a href="${href}">${text || url}</a>`);
            }}
          />
          <PromptTool
            label="Insert image"
            icon={<ImageIcon />}
            fields={["Image URL", "Width (px)"]}
            onSubmit={([src, w]) => {
              exec("insertHTML", `<img src="${src}" ${w ? `width="${w}"` : ""} style="border:0">`);
            }}
          />
          <Sep />
          <Dropdown
            label="Align"
            trigger={
              <span className="flex items-center gap-0.5">
                {active.justifyCenter ? (
                  <AlignCenter className="size-4" />
                ) : active.justifyRight ? (
                  <AlignRight className="size-4" />
                ) : (
                  <AlignLeft className="size-4" />
                )}
                <ChevronDown className="size-3" />
              </span>
            }
          >
            {(close) => (
              <div className="flex gap-0.5 p-1">
                <Tool
                  label="Align left"
                  onClick={() => {
                    exec("justifyLeft");
                    close();
                  }}
                >
                  <AlignLeft />
                </Tool>
                <Tool
                  label="Align center"
                  onClick={() => {
                    exec("justifyCenter");
                    close();
                  }}
                >
                  <AlignCenter />
                </Tool>
                <Tool
                  label="Align right"
                  onClick={() => {
                    exec("justifyRight");
                    close();
                  }}
                >
                  <AlignRight />
                </Tool>
              </div>
            )}
          </Dropdown>
          <Tool
            label="Numbered list"
            active={active.insertOrderedList}
            onClick={() => exec("insertOrderedList")}
          >
            <ListOrdered />
          </Tool>
          <Tool
            label="Bulleted list"
            active={active.insertUnorderedList}
            onClick={() => exec("insertUnorderedList")}
          >
            <List />
          </Tool>
          <Tool label="Indent less" onClick={() => exec("outdent")}>
            <IndentDecrease />
          </Tool>
          <Tool label="Indent more" onClick={() => exec("indent")}>
            <IndentIncrease />
          </Tool>
          <Sep />
          <Tool label="Remove formatting" onClick={() => exec("removeFormat")}>
            <RemoveFormatting />
          </Tool>
        </div>
      )}

      <div className="border-b border-slate-100 px-3 py-2.5">
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
          <Braces className="size-3.5" /> Insert directory field
        </p>
        <div className="flex flex-wrap gap-1.5" onMouseDown={keep}>
          {VARIABLES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() =>
                insert(
                  v.key === "companyLogo"
                    ? `<img src="{{companyLogo}}" alt="{{companyName}}" width="120" style="border:0">`
                    : `{{${v.key}}}`,
                )
              }
              className={cx(
                "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                v.group === "Company"
                  ? "bg-violet-50/60 text-violet-700 ring-violet-200/70 hover:bg-violet-100"
                  : v.group === "Contact"
                    ? "bg-emerald-50/60 text-emerald-700 ring-emerald-200/70 hover:bg-emerald-100"
                    : "bg-accent-50/70 text-accent-700 ring-accent-200/70 hover:bg-accent-100",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "visual" ? (
        <div
          ref={surface}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label="Signature editor"
          data-placeholder="Start typing your signature or insert a component…"
          onInput={emit}
          className="sig-surface min-h-0 flex-1 overflow-auto px-4 py-4 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brio-focus"
        />
      ) : (
        <textarea
          ref={textarea}
          value={html}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-label="Signature HTML"
          className="min-h-0 flex-1 resize-none overflow-auto bg-brio-ink px-4 py-3 font-mono text-xs leading-relaxed text-brio-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brio-primary"
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brio-subtle px-4 py-2 text-[11px] text-slate-400">
        <span>Fields like {"{{firstName}}"} are replaced per user at deploy time</span>
        <span className={cx("tabular-nums", html.length > 10000 && "font-medium text-rose-600")}>
          {html.length.toLocaleString()} / 10,000 chars
        </span>
      </div>
    </div>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-slate-200" />;
}

function Tool({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cx(
        "inline-flex size-8 items-center justify-center rounded-md transition-colors [&_svg]:size-4",
        active
          ? "bg-accent-100 text-accent-700"
          : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
      )}
    >
      {children}
    </button>
  );
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return { open, setOpen, ref };
}

function Dropdown({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div ref={ref}>
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        className={cx(
          "inline-flex h-8 items-center rounded-md px-1.5 text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900",
          open && "bg-slate-200/60",
        )}
      >
        {trigger}
      </button>
      {open && (
        <div
          className="absolute top-full left-2 z-30 mt-1 min-w-40 max-w-[calc(100%-1rem)] rounded-lg bg-white p-1 shadow-xl ring-1 ring-slate-200"
          onMouseDown={(e) => e.preventDefault()}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100"
    >
      {children}
    </button>
  );
}

function PromptTool({
  label,
  icon,
  fields,
  onSubmit,
}: {
  label: string;
  icon: ReactNode;
  fields: string[];
  onSubmit: (values: string[]) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  const [values, setValues] = useState<string[]>(fields.map(() => ""));
  const primary = fields.length > 1 && label === "Insert link" ? 1 : 0;
  const submit = () => {
    if (!values[primary].trim()) return;
    onSubmit(values.map((v) => v.trim()));
    setValues(fields.map(() => ""));
    setOpen(false);
  };
  return (
    <div ref={ref}>
      <Tool label={label} onClick={() => setOpen(!open)}>
        {icon}
      </Tool>
      {open && (
        <div
          className="absolute top-full right-2 z-30 mt-1 flex w-72 max-w-[calc(100%-1rem)] flex-col gap-2 rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-200"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {fields.map((f, i) => (
            <Input
              key={f}
              autoFocus={i === 0}
              placeholder={f}
              value={values[i]}
              onChange={(e) => setValues(values.map((v, j) => (j === i ? e.target.value : v)))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          ))}
          <div className="flex justify-end gap-1.5 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={submit} disabled={!values[primary].trim()}>
              Insert
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockMenu({ onPick }: { onPick: (html: string) => void }) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div ref={ref}>
      <Button
        size="sm"
        variant="secondary"
        icon={<Plus className="size-3.5" />}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
      >
        Add component
      </Button>
      {open && (
        <div
          className="absolute top-full right-4 z-30 mt-1 w-72 max-w-[calc(100%-2rem)] rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200"
          onMouseDown={(e) => e.preventDefault()}
        >
          {BLOCKS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                onPick(b.html);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="block text-[13px] font-medium text-slate-900">{b.label}</span>
              <span className="block text-xs text-slate-500">{b.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
