/**
 * @see https://github.com/sweetwisdom/onlyoffice-web-local — WASM + OnlyOffice WebSDK in the browser.
 * Live demo loads a remote .docx via `url` + `filename` query params on the hash route.
 */
export const DEFAULT_WASM_LOCAL_OFFICE_BASE =
  "https://sweetwisdom.github.io/onlyoffice-web-local";

export function getWasmLocalOfficeBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WASM_LOCAL_OFFICE_URL?.trim();
  return (fromEnv || DEFAULT_WASM_LOCAL_OFFICE_BASE).replace(/\/$/, "");
}

/**
 * Build the hash URL the demo expects, e.g.
 * `https://sweetwisdom.github.io/onlyoffice-web-local/#/?url=...&filename=file.docx`
 */
export function buildWasmLocalOfficeOpenUrl(options: {
  /** Base of the WASM office app (no trailing slash) */
  wasmAppBaseUrl: string;
  /** Absolute HTTP(S) URL that returns the .docx (must be fetchable from the WASM app origin) */
  documentFileUrl: string;
  fileName: string;
}): string {
  const base = options.wasmAppBaseUrl.replace(/\/$/, "");
  const q = new URLSearchParams();
  q.set("url", options.documentFileUrl);
  q.set("filename", options.fileName);
  return `${base}/#/?${q.toString()}`;
}
