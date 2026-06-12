"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocSession } from "@/context/doc-session";
import { cn } from "@/lib/utils";

const ACCEPT =
  ".docx,.txt,.text,.md,.markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";

export function LnkbaseHome() {
  const router = useRouter();
  const { loadFile, fileName, kind, clear } = useDocSession();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ready = Boolean(fileName && kind);

  const onPick = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      try {
        await loadFile(file);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not read file.");
      } finally {
        setBusy(false);
      }
    },
    [loadFile],
  );

  const goDoc = useCallback(() => {
    if (ready) router.push("/doc");
  }, [ready, router]);

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200 px-6 py-10 text-center sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
          Lnkbase
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Drop any file and edit it live
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-600">
          Upload your document to start editing instantly on the page, then
          format, fix tables, and export when you are done.
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-10">
        <div
          className={cn(
            "relative w-full max-w-xl rounded-2xl border-2 border-dashed transition-colors",
            dragOver
              ? "border-violet-500 bg-violet-50/80"
              : "border-neutral-300 bg-neutral-50/50",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) void onPick(f);
          }}
        >
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <p className="text-sm font-medium text-neutral-800">
              Drag & drop .docx, .txt, or .md
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPick(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              Choose file
            </button>
          </div>
        </div>

        {ready && (
          <div className="mt-8 w-full max-w-xl rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Current file
            </p>
            <p className="mt-1 font-mono text-sm text-neutral-900">{fileName}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goDoc}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500"
              >
                Open document
              </button>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setError(null);
                }}
                className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-6 max-w-xl text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {busy && (
          <p className="mt-4 text-sm text-neutral-500">Reading file…</p>
        )}
      </main>

      <footer className="border-t border-neutral-100 py-6 text-center text-xs text-neutral-400">
        Lnkdoc
      </footer>
    </div>
  );
}
