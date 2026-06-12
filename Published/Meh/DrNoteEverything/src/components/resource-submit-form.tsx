"use client";

import { CheckCircle2, FolderUp, Link as LinkIcon, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function ResourceSubmitForm({
  backHref,
  contextTitle,
  resourceTypes,
}: {
  backHref: string;
  contextTitle: string;
  resourceTypes: string[];
}) {
  const router = useRouter();
  const [folderName, setFolderName] = useState("");
  const [success, setSuccess] = useState(false);
  type FolderDropItem = DataTransferItem & {
    webkitGetAsEntry?: () => { name?: string } | null;
  };

  const folderInputProps = {
    directory: "",
    webkitdirectory: "",
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(true);
    window.setTimeout(() => router.push(backHref), 1100);
  };

  return (
    <form className="resource-submit-page-form" onSubmit={submit}>
      {success ? (
        <div className="resource-submit-success">
          <CheckCircle2 aria-hidden="true" size={22} strokeWidth={2.4} />
          Added. Returning to {contextTitle}.
        </div>
      ) : null}

      <label>
        <span>Resource link</span>
        <span className="resource-submit-input">
          <LinkIcon aria-hidden="true" size={17} strokeWidth={2.2} />
          <input name="link" placeholder="Paste link" type="url" />
        </span>
      </label>

      <label>
        <span>Resource type</span>
        <select name="type" defaultValue={resourceTypes[0] ?? "Qbank"}>
          {resourceTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label
        className="resource-folder-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const item = event.dataTransfer.items?.[0] as FolderDropItem | undefined;
          const entry = item?.webkitGetAsEntry?.() ?? null;
          setFolderName(entry?.name ?? event.dataTransfer.files?.[0]?.name ?? "Folder selected");
        }}
      >
        <UploadCloud aria-hidden="true" size={24} strokeWidth={2.1} />
        <strong>Drop a folder here</strong>
        <span>{folderName || "or choose a folder from your device"}</span>
        <input
          aria-label="Upload resource folder"
          type="file"
          multiple
          {...folderInputProps}
          onChange={(event) => setFolderName(event.currentTarget.files?.[0]?.webkitRelativePath?.split("/")[0] ?? "Folder selected")}
        />
      </label>

      <button type="submit">
        <FolderUp aria-hidden="true" size={18} strokeWidth={2.2} />
        Add resource
      </button>
    </form>
  );
}
