export const installedAppsKey = "lnkbase-installed-apps";
export const emptyInstalledAppsSnapshot = "[]";

export function readInstalledSlugs() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(installedAppsKey);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeInstalledSlugs(slugs: string[]) {
  window.localStorage.setItem(installedAppsKey, JSON.stringify(slugs));
  window.dispatchEvent(new Event("lnkbase-installed-change"));
}

export function getInstalledSnapshot() {
  if (typeof window === "undefined") {
    return emptyInstalledAppsSnapshot;
  }

  return window.localStorage.getItem(installedAppsKey) ?? emptyInstalledAppsSnapshot;
}

export function subscribeToInstalledApps(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("lnkbase-installed-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("lnkbase-installed-change", callback);
  };
}
