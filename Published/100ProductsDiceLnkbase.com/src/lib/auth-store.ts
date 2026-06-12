export const signedUpKey = "lnkbase-signed-up";
export const signedOutSnapshot = "signed-out";
export const signedUpSnapshot = "signed-up";

export function isSignedUp() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(signedUpKey) === "true";
}

export function markSignedUp() {
  window.localStorage.setItem(signedUpKey, "true");
  window.dispatchEvent(new Event("lnkbase-auth-change"));
}

export function getAuthSnapshot() {
  return isSignedUp() ? signedUpSnapshot : signedOutSnapshot;
}

export function subscribeToAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("lnkbase-auth-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("lnkbase-auth-change", callback);
  };
}
