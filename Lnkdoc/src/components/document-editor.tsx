"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color, FontFamily } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import mammoth from "mammoth";
import type { Editor } from "@tiptap/react";
import { cn, escapeHtml } from "@/lib/utils";
import { MAMMOTH_EXTRA_STYLE_MAP } from "@/lib/mammoth-style-map";
import {
  ImportParagraph,
  ImportHeading,
  ImportBlockquote,
  ImportTable,
  ImportTableRow,
  ImportTableHeader,
  ImportTableCell,
  PageCut,
} from "@/lib/tiptap-import-nodes";
import type { DocKind } from "@/context/doc-session";

function textToHtml(body: string): string {
  if (!body.trim()) return "<p></p>";
  return body
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line) || "<br />"}</p>`)
    .join("");
}

type Props = {
  version: number;
  fileName: string | null;
  kind: DocKind | null;
  docxBuffer: ArrayBuffer | null;
  textBody: string | null;
  onEditor: (editor: Editor | null) => void;
  onLoadError: (message: string | null) => void;
  onImportWarnings: (message: string | null) => void;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
};

export function DocumentEditor({
  version,
  fileName,
  kind,
  docxBuffer,
  textBody,
  onEditor,
  onLoadError,
  onImportWarnings,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
        heading: false,
        blockquote: false,
        link: false,
      }),
      ImportParagraph,
      ImportHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      ImportBlockquote,
      ImportTable.configure({
        resizable: false,
        renderWrapper: true,
        HTMLAttributes: { class: "lnkdoc-table" },
      }),
      ImportTableRow,
      ImportTableHeader,
      ImportTableCell,
      PageCut,
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Edit here — exports use this view.",
      }),
    ],
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "lnkdoc-editor w-full focus:outline-none",
      },
    },
  });

  useEffect(() => {
    onEditor(editor ?? null);
    return () => onEditor(null);
  }, [editor, onEditor]);

  const loadIntoEditor = useCallback(
    async (opts: {
      kind: DocKind;
      docxBuffer: ArrayBuffer | null;
      textBody: string | null;
    }) => {
      if (!editor) return;
      onLoadError(null);
      onImportWarnings(null);
      try {
        if (opts.kind === "docx" && opts.docxBuffer) {
          const { value: html, messages } = await mammoth.convertToHtml(
            { arrayBuffer: opts.docxBuffer.slice(0) },
            {
              styleMap: MAMMOTH_EXTRA_STYLE_MAP,
              includeEmbeddedStyleMap: true,
              ignoreEmptyParagraphs: false,
              convertImage: mammoth.images.imgElement((image) =>
                image.read("base64").then((imageBuffer) => ({
                  src: `data:${image.contentType};base64,${imageBuffer}`,
                })),
              ),
            },
          );
          if (messages.length > 0) {
            const warns = messages
              .filter((m) => m.type === "warning")
              .map((m) => m.message)
              .join(" ");
            if (warns) onImportWarnings(warns);
          }
          editor.commands.setContent(html || "<p></p>");
        } else if (opts.kind === "text" && opts.textBody !== null) {
          editor.commands.setContent(textToHtml(opts.textBody));
        }
      } catch (e) {
        onLoadError(
          e instanceof Error ? e.message : "Could not load into editor.",
        );
      }
    },
    [editor, onLoadError, onImportWarnings],
  );

  useEffect(() => {
    if (!editor || kind === null) return;
    if (kind === "docx" && docxBuffer) {
      void loadIntoEditor({ kind: "docx", docxBuffer, textBody: null });
    } else if (kind === "text" && textBody !== null) {
      void loadIntoEditor({ kind: "text", docxBuffer: null, textBody });
    }
  }, [editor, version, kind, docxBuffer, textBody, loadIntoEditor]);

  return (
    <div
      className={cn(
        "lnkdoc-scroll-canvas relative min-h-0 flex-1 overflow-y-auto",
        dragOver && "ring-2 ring-inset ring-violet-400",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="mx-auto w-full max-w-[calc(210mm+48px)] px-4 py-10 sm:px-6">
        <div className="lnkdoc-paper lnkdoc-policy-scope">
          <EditorContent editor={editor} />
        </div>
      </div>
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 text-lg font-medium text-violet-700 backdrop-blur-[2px]">
          Release to replace document
        </div>
      )}
    </div>
  );
}
