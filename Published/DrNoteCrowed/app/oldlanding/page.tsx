import type { Metadata } from "next";
import DrNoteApp from "@/components/drnote-app";
import { metadataForPath, siteConfig } from "@/lib/seo";

export const metadata: Metadata = metadataForPath({
  title: "Archived DrNote Landing",
  description: siteConfig.description,
  path: "/oldlanding",
});

export default function Page() {
  return <DrNoteApp />;
}
