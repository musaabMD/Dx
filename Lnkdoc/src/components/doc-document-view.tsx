"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { useDocSession } from "@/context/doc-session";
import { DocumentEditor } from "@/components/document-editor";
import { EditorToolbar } from "@/components/editor-toolbar";
import { OnlyofficeWordEditor } from "@/components/onlyoffice-word-editor";
import { cn, stripExtension } from "@/lib/utils";
import {
  exportEditorHtml,
  exportEditorTxt,
  exportEditorDocx,
} from "@/lib/export-editor";
import {
  buildWasmLocalOfficeOpenUrl,
  getWasmLocalOfficeBase,
} from "@/lib/wasm-local-office";

type WordUi = "onlyoffice" | "tiptap";

export function DocDocumentView() {
  const router = useRouter();
  const onlyofficeServer =
    process.env.NEXT_PUBLIC_ONLYOFFICE_SERVER_URL?.trim() ?? "";

  const {
    version,
    fileName,
    kind,
    docxBuffer,
    textBody,
    loadFile,
    importWarnings,
    setImportWarnings,
  } = useDocSession();

  const [wordUi, setWordUi] = useState<WordUi>(() =>
    onlyofficeServer ? "onlyoffice" : "tiptap",
  );
  const [editor, setEditor] = useState<Editor | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [wasmDocId, setWasmDocId] = useState<string | null>(null);
  const [wasmRegistering, setWasmRegistering] = useState(false);
  const [wasmRegisterError, setWasmRegisterError] = useState<string | null>(
    null,
  );
  const [publicAppOrigin, setPublicAppOrigin] = useState("");

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim() || window.location.origin;
    setPublicAppOrigin(base.replace(/\/$/, ""));
  }, []);

  useEffect(() => {
    if (kind !== "docx" || !docxBuffer || !fileName) {
      setWasmDocId(null);
      setWasmRegisterError(null);
      return;
    }
    let cancelled = false;
    setWasmRegistering(true);
    setWasmRegisterError(null);
    (async () => {
      try {
        const blob = new Blob([docxBuffer], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const fd = new FormData();
        fd.append("file", blob, fileName);
        const res = await fetch("/api/onlyoffice/register", {
          method: "POST",
          body: fd,
        });
        const data = (await res.json()) as { id?: string; error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setWasmDocId(null);
          setWasmRegisterError(data.error ?? "Register failed");
          return;
        }
        if (data.id) setWasmDocId(data.id);
        else {
          setWasmDocId(null);
          setWasmRegisterError("No document id returned");
        }
      } catch {
        if (!cancelled) {
          setWasmDocId(null);
          setWasmRegisterError("Network error while registering document");
        }
      } finally {
        if (!cancelled) setWasmRegistering(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, docxBuffer, fileName, version]);

  useEffect(() => {
    if (!kind) {
      router.replace("/");
    }
  }, [kind, router]);

  useEffect(() => {
    if (onlyofficeServer && kind === "docx") {
      setWordUi("onlyoffice");
    } else {
      setWordUi("tiptap");
    }
  }, [version, kind, onlyofficeServer]);

  const baseName = stripExtension(fileName ?? "document");
  const useOnlyoffice =
    Boolean(onlyofficeServer) &&
    kind === "docx" &&
    Boolean(docxBuffer) &&
    wordUi === "onlyoffice";

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (!f) return;
      try {
        await loadFile(f);
        setLoadError(null);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Could not load file.",
        );
      }
    },
    [loadFile],
  );

  const handleExportDocx = useCallback(async () => {
    if (!editor) return;
    setExportError(null);
    try {
      await exportEditorDocx(editor, baseName);
    } catch (e) {
      setExportError(
        e instanceof Error ? e.message : "Word export failed.",
      );
    }
  }, [editor, baseName]);

  if (!kind || !fileName) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-100 text-sm text-neutral-600">
        Redirecting to Lnkbase…
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 flex-row bg-neutral-200">
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-neutral-200 bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
          <div className="flex flex-col gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
              >
                ← Lnkbase
              </Link>
            </div>

            <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                Document
              </p>
              <p className="mt-1 break-all font-mono text-xs leading-snug text-neutral-800">
                {fileName}
              </p>
            </div>

            {onlyofficeServer && kind === "docx" && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  Editor
                </p>
                <button
                  type="button"
                  onClick={() => setWordUi("onlyoffice")}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    wordUi === "onlyoffice"
                      ? "border-violet-500 bg-violet-50 text-violet-900"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  Word (ONLYOFFICE)
                  <span className="mt-0.5 block text-xs font-normal text-neutral-500">
                    Same class of editor as real Microsoft Word layout
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setWordUi("tiptap")}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    wordUi === "tiptap"
                      ? "border-violet-500 bg-violet-50 text-violet-900"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  Simple web editor
                  <span className="mt-0.5 block text-xs font-normal text-neutral-500">
                    Fast, works without Document Server
                  </span>
                </button>
              </div>
            )}

            {!onlyofficeServer && kind === "docx" && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
                For <strong>Word-accurate</strong> view and edit, run{" "}
                <strong>ONLYOFFICE Docs</strong> (Docker) and set{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[10px]">
                  NEXT_PUBLIC_ONLYOFFICE_SERVER_URL
                </code>{" "}
                in{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[10px]">
                  .env.local
                </code>
                . If Document Server runs in Docker on the same machine, also
                set{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[10px]">
                  NEXT_PUBLIC_ONLYOFFICE_DOCUMENT_ORIGIN=http://host.docker.internal:3000
                </code>{" "}
                (replace port with your dev port). Or use{" "}
                <strong>Open WASM Word</strong> below (no Docker) if your app
                URL is public HTTPS.
              </p>
            )}

            {kind === "docx" && (
              <div className="space-y-2 rounded-lg border border-sky-200 bg-sky-50/90 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-800/90">
                  WASM Word (browser)
                </p>
                <p className="text-xs leading-relaxed text-sky-950">
                  Opens{" "}
                  <a
                    href="https://sweetwisdom.github.io/onlyoffice-web-local/#/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sky-800 underline underline-offset-2"
                  >
                    sweetwisdom/onlyoffice-web-local
                  </a>{" "}
                  in a new tab with your file. Same idea as{" "}
                  <a
                    href="https://github.com/sweetwisdom/onlyoffice-web-local"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sky-800 underline underline-offset-2"
                  >
                    the WASM + WebSDK demo
                  </a>
                  .
                </p>
                <button
                  type="button"
                  disabled={
                    !wasmDocId ||
                    wasmRegistering ||
                    !publicAppOrigin ||
                    !fileName
                  }
                  onClick={() => {
                    if (!wasmDocId || !publicAppOrigin || !fileName) return;
                    const docUrl = `${publicAppOrigin}/api/onlyoffice/document?id=${encodeURIComponent(wasmDocId)}`;
                    const openUrl = buildWasmLocalOfficeOpenUrl({
                      wasmAppBaseUrl: getWasmLocalOfficeBase(),
                      documentFileUrl: docUrl,
                      fileName,
                    });
                    window.open(openUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-medium text-sky-950 shadow-sm hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {wasmRegistering
                    ? "Preparing link…"
                    : "Open WASM Word (new tab)"}
                </button>
                {wasmRegisterError && (
                  <p className="text-xs text-red-600" role="alert">
                    {wasmRegisterError}
                  </p>
                )}
                {publicAppOrigin.startsWith("http:") &&
                  /localhost|127\.0\.0\.1/i.test(publicAppOrigin) && (
                    <p className="text-[11px] leading-relaxed text-amber-900">
                      The GitHub Pages demo is served over{" "}
                      <strong>HTTPS</strong>; browsers usually block fetching a{" "}
                      <strong>http://localhost</strong> document URL (mixed
                      content). Use a tunneled or deployed HTTPS URL, or set{" "}
                      <code className="rounded bg-white/80 px-1 font-mono text-[10px]">
                        NEXT_PUBLIC_PUBLIC_APP_URL
                      </code>{" "}
                      to that origin.
                    </p>
                  )}
                <p className="text-[10px] leading-relaxed text-sky-900/80">
                  Override demo base:{" "}
                  <code className="rounded bg-white/70 px-1 font-mono">
                    NEXT_PUBLIC_WASM_LOCAL_OFFICE_URL
                  </code>
                  .
                </p>
              </div>
            )}

            <p className="text-[10px] leading-relaxed text-neutral-500">
              TipTap + Next sample (DOCX import uses TipTap Pro):{" "}
              <a
                href="https://github.com/Okramjimmy/docx-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-700 underline underline-offset-2"
              >
                Okramjimmy/docx-editor
              </a>
              .
            </p>

            {useOnlyoffice ? (
              <p className="rounded-lg border border-emerald-100 bg-emerald-50/90 px-3 py-2 text-xs leading-relaxed text-emerald-950">
                Save a copy from the Word toolbar:{" "}
                <strong>File → Save as</strong> (or Download as). Sidebar
                export buttons apply to the simple web editor only.
              </p>
            ) : (
              <p className="rounded-lg border border-violet-100 bg-violet-50/90 px-3 py-2 text-xs leading-relaxed text-violet-950">
                Click in the page and edit. Word styles are mapped via Mammoth;
                complex templates may differ slightly from Office.
              </p>
            )}

            {kind === "text" && (
              <p className="rounded-lg border border-neutral-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
                Plain text file — exports match the editor.
              </p>
            )}

            {!useOnlyoffice && (
              <>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                    Export
                  </p>
                  <button
                    type="button"
                    disabled={!editor}
                    onClick={() => editor && exportEditorHtml(editor, baseName)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Export HTML
                  </button>
                  <button
                    type="button"
                    disabled={!editor}
                    onClick={() => editor && exportEditorTxt(editor, baseName)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Export TXT
                  </button>
                  <button
                    type="button"
                    disabled={!editor}
                    onClick={() => void handleExportDocx()}
                    className="w-full rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Export Word
                  </button>
                </div>

                <div className="border-t border-neutral-200 pt-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                    Formatting
                  </p>
                  <EditorToolbar editor={editor} variant="sidebar" />
                </div>
              </>
            )}
          </div>
        </div>

        {(loadError || importWarnings || exportError) && (
          <div className="max-h-40 shrink-0 overflow-y-auto border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
            {loadError && (
              <p className="text-red-600" role="alert">
                {loadError}
              </p>
            )}
            {exportError && (
              <p className="text-red-600" role="alert">
                {exportError}
              </p>
            )}
            {importWarnings && !loadError && (
              <p className="text-amber-800">{importWarnings}</p>
            )}
          </div>
        )}
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {useOnlyoffice && docxBuffer ? (
          <OnlyofficeWordEditor
            fileName={fileName}
            docxBuffer={docxBuffer}
            version={version}
            documentServerUrl={onlyofficeServer}
            className="min-h-0 flex-1"
          />
        ) : (
          <DocumentEditor
            version={version}
            fileName={fileName}
            kind={kind}
            docxBuffer={docxBuffer}
            textBody={textBody}
            onEditor={setEditor}
            onLoadError={setLoadError}
            onImportWarnings={setImportWarnings}
            dragOver={dragOver}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          />
        )}
      </main>
    </div>
  );
}
