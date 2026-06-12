"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Check, Plus } from "lucide-react";

import {
  emptyInstalledAppsSnapshot,
  getInstalledSnapshot,
  readInstalledSlugs,
  subscribeToInstalledApps,
  writeInstalledSlugs,
} from "@/lib/installed-store";
import { Button } from "@/components/ui/button";

type AppInstallButtonProps = {
  slug: string;
};

export function AppInstallButton({ slug }: AppInstallButtonProps) {
  const installedSnapshot = useSyncExternalStore(
    subscribeToInstalledApps,
    getInstalledSnapshot,
    () => emptyInstalledAppsSnapshot,
  );
  const installedSlugs = useMemo(
    () => JSON.parse(installedSnapshot) as string[],
    [installedSnapshot],
  );
  const installed = installedSlugs.includes(slug);

  function toggleInstalled() {
    const currentSlugs = readInstalledSlugs();
    const next = currentSlugs.includes(slug)
      ? currentSlugs.filter((item) => item !== slug)
      : [...currentSlugs, slug];

    writeInstalledSlugs(next);
  }

  return (
    <Button variant={installed ? "secondary" : "default"} onClick={toggleInstalled}>
      {installed ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
      {installed ? "Added" : "Add app"}
    </Button>
  );
}
