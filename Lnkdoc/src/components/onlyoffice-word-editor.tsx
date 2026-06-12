"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { IConfig } from "@onlyoffice/document-editor-react";
import { cn } from "@/lib/utils";

const DocumentEditor = dynamic(
  () =>
    import("@onlyoffice/document-editor-react").then((m) => m.DocumentEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center bg-neutral-100 text-sm text-neutral-600">
        Loading ONLYOFFICE…
      </div>
    ),
  },
);

type Props = {
  fileName: string;
  docxBuffer: ArrayBuffer;
  version: number;
  documentServerUrl: string;
  className?: string;
};

/**
 * Real Word-like UI via ONLYOFFICE Document Server (self-hosted).
 * Set NEXT_PUBLIC_ONLYOFFICE_SERVER_URL and run Document Server (Docker).
 * If the server runs in Docker and Next on the host, set
 * NEXT_PUBLIC_ONLYOFFICE_DOCUMENT_ORIGIN=http://host.docker.internal:3000
 * so the server can fetch /api/onlyoffice/document.
 */
export function OnlyofficeWordEditor({
  fileName,
  docxBuffer,
  version,
  documentServerUrl,
  className,
}: Props) {
  const [docId, setDocId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(true);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [documentOrigin, setDocumentOrigin] = useState("");

  useEffect(() => {
    const fromEnv = process.env.NEXT_PUBLIC_ONLYOFFICE_DOCUMENT_ORIGIN?.replace(
      /\/$/,
      "",
    );
    setDocumentOrigin(fromEnv || window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRegistering(true);
    setLoadError(null);
    setDocId(null);

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
        if (!res.ok) {
          throw new Error(data.error || `Register failed (${res.status})`);
        }
        if (!data.id) throw new Error("No document id");
        if (!cancelled) setDocId(data.id);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Could not prepare document.",
          );
        }
      } finally {
        if (!cancelled) setRegistering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [docxBuffer, fileName, version]);

  const serverBase = documentServerUrl.endsWith("/")
    ? documentServerUrl
    : `${documentServerUrl}/`;

  const config: IConfig | null = useMemo(() => {
    if (!docId || !documentOrigin) return null;
    const url = `${documentOrigin}/api/onlyoffice/document?id=${encodeURIComponent(docId)}`;
    return {
      documentType: "word",
      type: "desktop",
      document: {
        fileType: "docx",
        key: `lnkdoc-${docId}-v${version}`,
        title: fileName,
        url,
        permissions: {
          edit: true,
          download: true,
          print: true,
          review: true,
          comment: true,
        },
      },
      editorConfig: {
        mode: "edit",
        lang: "en",
        user: {
          id: "lnkdoc-user",
          name: "Editor",
        },
        customization: {
          autosave: true,
          forcesave: false,
          compactHeader: false,
        },
      },
    };
  }, [docId, documentOrigin, fileName, version]);

  if (registering || !documentOrigin) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center bg-neutral-100 text-sm text-neutral-600",
          className,
        )}
      >
        Preparing document for ONLYOFFICE…
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-2 bg-red-50 px-6 text-center text-sm text-red-800",
          className,
        )}
      >
        <p className="font-medium">Could not open in ONLYOFFICE</p>
        <p className="text-red-700">{loadError}</p>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-neutral-200", className)}>
      {componentError && (
        <p className="shrink-0 bg-amber-100 px-3 py-2 text-xs text-amber-900">
          {componentError}
        </p>
      )}
      <div className="min-h-0 flex-1 w-full min-w-0">
        <DocumentEditor
          id="lnkdoc-onlyoffice-editor"
          documentServerUrl={serverBase}
          config={config}
          height="100%"
          width="100%"
          onLoadComponentError={(_code, desc) => {
            setComponentError(
              desc ||
                "ONLYOFFICE failed to load. Check NEXT_PUBLIC_ONLYOFFICE_SERVER_URL and that Document Server is running.",
            );
          }}
        />
      </div>
    </div>
  );
}
