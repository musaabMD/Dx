"use server";

import { signOut as authkitSignOut } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";
import { getOrCreateGuest } from "@/lib/guest";

export async function signOutAction(): Promise<void> {
  await authkitSignOut();
}

// Provisions a guest cookie if one doesn't exist and revalidates the current
// path so server-rendered content picks up the new identity immediately.
export async function ensureGuestAction(path: string = "/"): Promise<void> {
  await getOrCreateGuest();
  revalidatePath(path);
}
