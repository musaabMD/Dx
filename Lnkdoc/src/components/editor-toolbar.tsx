"use client";

import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

const FONT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Sans", value: "system-ui, sans-serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
  sidebar,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  title: string;
  sidebar?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-md text-sm font-medium transition-colors",
        sidebar
          ? "min-h-9 w-full px-2 py-2"
          : "px-2.5 py-1.5",
        "border border-neutral-300 bg-white text-neutral-800 shadow-sm",
        "hover:bg-neutral-50 disabled:opacity-40",
        active && "border-violet-500 bg-violet-50 text-violet-900",
        sidebar && "justify-center text-center",
      )}
    >
      {children}
    </button>
  );
}

function ToolGroup({
  label,
  sidebar,
  children,
}: {
  label: string;
  sidebar: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn(sidebar && "space-y-1.5 pb-1")}>
      {sidebar && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </p>
      )}
      <div
        className={cn(
          sidebar ? "grid grid-cols-2 gap-1" : "flex flex-wrap items-center gap-1",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function BarDivider({ sidebar }: { sidebar: boolean }) {
  if (sidebar) {
    return <div className="my-1 h-px w-full bg-neutral-200" aria-hidden />;
  }
  return <div className="mx-1 h-6 w-px bg-neutral-200" aria-hidden />;
}

export function EditorToolbar({
  editor,
  disabled,
  variant = "bar",
}: {
  editor: Editor | null;
  disabled?: boolean;
  variant?: "bar" | "sidebar";
}) {
  const sidebar = variant === "sidebar";

  if (!editor) {
    if (!sidebar) return null;
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-6 text-center text-xs text-neutral-500">
        Loading editor…
      </div>
    );
  }

  const sb = sidebar;

  return (
    <div
      className={cn(
        sidebar
          ? "flex flex-col gap-3"
          : "flex flex-wrap items-center gap-1.5 border-t border-neutral-200 bg-white/90 px-3 py-2 backdrop-blur-sm",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <ToolGroup label="Style" sidebar={sb}>
        <ToolbarButton
          sidebar={sb}
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </ToolbarButton>
      </ToolGroup>

      <BarDivider sidebar={sb} />

      <ToolGroup label="Structure" sidebar={sb}>
        <ToolbarButton
          sidebar={sb}
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Paragraph"
          active={
            editor.isActive("paragraph") && !editor.isActive("heading")
          }
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          P
        </ToolbarButton>
      </ToolGroup>

      <BarDivider sidebar={sb} />

      <ToolGroup label="Lists & blocks" sidebar={sb}>
        <ToolbarButton
          sidebar={sb}
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          “ ”
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Visual page gap"
          onClick={() =>
            editor.chain().focus().insertContent({ type: "pageCut" }).run()
          }
        >
          Page gap
        </ToolbarButton>
      </ToolGroup>

      <BarDivider sidebar={sb} />

      <ToolGroup label="Align" sidebar={sb}>
        <ToolbarButton
          sidebar={sb}
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          L
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          C
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          R
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          J
        </ToolbarButton>
      </ToolGroup>

      <BarDivider sidebar={sb} />

      <div className={cn("space-y-2", sidebar && "w-full")}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          Color
        </p>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            sidebar && "flex-col items-stretch",
          )}
        >
          <label
            className={cn(
              "flex items-center gap-2 text-xs text-neutral-600",
              sidebar && "w-full justify-between",
            )}
          >
            Text
            <input
              type="color"
              title="Text color"
              className="h-9 w-14 cursor-pointer rounded border border-neutral-300 bg-white p-0.5"
              value={editor.getAttributes("textStyle").color || "#111827"}
              onChange={(e) =>
                editor.chain().focus().setColor(e.target.value).run()
              }
            />
          </label>
          <label
            className={cn(
              "flex items-center gap-2 text-xs text-neutral-600",
              sidebar && "w-full justify-between",
            )}
          >
            Highlight
            <input
              type="color"
              title="Highlight"
              className="h-9 w-14 cursor-pointer rounded border border-neutral-300 bg-white p-0.5"
              value={editor.getAttributes("highlight").color || "#fde047"}
              onChange={(e) =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: e.target.value })
                  .run()
              }
            />
          </label>
        </div>
      </div>

      <BarDivider sidebar={sb} />

      <div className={cn("space-y-1.5", sidebar && "w-full")}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          Font
        </p>
        <select
          title="Font family"
          className={cn(
            "h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-800 shadow-sm",
            sidebar ? "w-full" : "max-w-[140px]",
          )}
          value={editor.getAttributes("textStyle").fontFamily || ""}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(v).run();
            }
          }}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <BarDivider sidebar={sb} />

      <ToolGroup label="History" sidebar={sb}>
        <ToolbarButton
          sidebar={sb}
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          sidebar={sb}
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </ToolbarButton>
      </ToolGroup>
    </div>
  );
}
