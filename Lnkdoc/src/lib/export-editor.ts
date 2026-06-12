import type { Editor } from "@tiptap/react";
import { saveAs } from "file-saver";
import { escapeHtml } from "@/lib/utils";

export function exportEditorHtml(editor: Editor, baseName: string) {
  const inner = editor.getHTML();
  const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(baseName)}</title><style>
body{margin:0;background:#e5e7eb;font-family:Calibri,Segoe UI,system-ui,sans-serif;}
.sheet{max-width:210mm;min-height:297mm;margin:24px auto;padding:25mm 20mm;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.1);border:1px solid #e5e7eb;}
table{border-collapse:collapse;width:100%;} th,td{border:1px solid #d1d5db;padding:4px 8px;}
img{max-width:100%;height:auto;}
</style></head><body><div class="sheet">${inner}</div></body></html>`;
  saveAs(
    new Blob([doc], { type: "text/html;charset=utf-8" }),
    `${baseName}.html`,
  );
}

export function exportEditorTxt(editor: Editor, baseName: string) {
  saveAs(
    new Blob([editor.getText()], { type: "text/plain;charset=utf-8" }),
    `${baseName}.txt`,
  );
}

export async function exportEditorDocx(editor: Editor, baseName: string) {
  const { asBlob } = await import("html-docx-js-typescript");
  const inner = editor.getHTML();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${inner}</body></html>`;
  const blob = await asBlob(html);
  if (blob instanceof Blob) {
    saveAs(blob, `${baseName}.docx`);
  }
}
