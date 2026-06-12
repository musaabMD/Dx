"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DocKind = "docx" | "text";

export type DocSessionState = {
  /** Bumps when a new file is loaded so children re-run effects */
  version: number;
  fileName: string | null;
  kind: DocKind | null;
  docxBuffer: ArrayBuffer | null;
  textBody: string | null;
  /** Mammoth / import warnings from last .docx load */
  importWarnings: string | null;
  setImportWarnings: (s: string | null) => void;
  loadFile: (file: File) => Promise<void>;
  clear: () => void;
};

const DocSessionContext = createContext<DocSessionState | null>(null);

export function DocSessionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [kind, setKind] = useState<DocKind | null>(null);
  const [docxBuffer, setDocxBuffer] = useState<ArrayBuffer | null>(null);
  const [textBody, setTextBody] = useState<string | null>(null);
  const [importWarnings, setImportWarnings] = useState<string | null>(null);

  const clear = useCallback(() => {
    setFileName(null);
    setKind(null);
    setDocxBuffer(null);
    setTextBody(null);
    setImportWarnings(null);
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setImportWarnings(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (ext === "docx") {
      const raw = await file.arrayBuffer();
      const copy = raw.slice(0);
      setDocxBuffer(copy);
      setTextBody(null);
      setKind("docx");
      setFileName(file.name);
      setVersion((v) => v + 1);
      return;
    }

    if (
      ext === "txt" ||
      ext === "text" ||
      ext === "md" ||
      ext === "markdown"
    ) {
      const text = await file.text();
      setTextBody(text);
      setDocxBuffer(null);
      setKind("text");
      setFileName(file.name);
      setVersion((v) => v + 1);
      return;
    }

    throw new Error(`Unsupported format (.${ext}). Use .docx, .txt, or .md.`);
  }, []);

  const value = useMemo(
    () => ({
      version,
      fileName,
      kind,
      docxBuffer,
      textBody,
      importWarnings,
      setImportWarnings,
      loadFile,
      clear,
    }),
    [
      version,
      fileName,
      kind,
      docxBuffer,
      textBody,
      importWarnings,
      loadFile,
      clear,
    ],
  );

  return (
    <DocSessionContext.Provider value={value}>
      {children}
    </DocSessionContext.Provider>
  );
}

export function useDocSession() {
  const ctx = useContext(DocSessionContext);
  if (!ctx) {
    throw new Error("useDocSession must be used within DocSessionProvider");
  }
  return ctx;
}
