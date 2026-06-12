import {
  getSignInUrl as authkitGetSignInUrl,
  getSignUpUrl as authkitGetSignUpUrl,
  withAuth as authkitWithAuth,
} from "@workos-inc/authkit-nextjs";
import { getOrCreateGuest, readGuest } from "./guest";

export type AuthkitUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
};

export type AuthState = {
  user: AuthkitUser | null;
  configured: boolean;
};

export type Participant = {
  kind: "user" | "guest";
  id: string;
  name: string;
  email: string | null;
  avatarColor: string;
  profilePictureUrl: string | null;
};

function isWorkOSConfigured(): boolean {
  return Boolean(
    process.env.WORKOS_CLIENT_ID &&
      process.env.WORKOS_API_KEY &&
      process.env.WORKOS_COOKIE_PASSWORD
  );
}

// Tolerant wrapper: if WorkOS isn't configured (or temporarily errors), we
// fall back to "signed out" instead of crashing the whole page render. Real
// auth-required actions still fail loudly server-side.
export async function getAuthState(): Promise<AuthState> {
  if (!isWorkOSConfigured()) {
    return { user: null, configured: false };
  }
  try {
    const { user } = await authkitWithAuth();
    if (!user) return { user: null, configured: true };
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        profilePictureUrl: user.profilePictureUrl ?? null,
      },
      configured: true,
    };
  } catch {
    return { user: null, configured: false };
  }
}

export async function getSignInUrl(): Promise<string> {
  if (!isWorkOSConfigured()) return "/auth/not-configured";
  try {
    return await authkitGetSignInUrl();
  } catch {
    return "/auth/not-configured";
  }
}

export async function getSignUpUrl(): Promise<string> {
  if (!isWorkOSConfigured()) return "/auth/not-configured";
  try {
    return await authkitGetSignUpUrl();
  } catch {
    return "/auth/not-configured";
  }
}

const PALETTE = [
  "#E11D48", "#7C3AED", "#0891B2", "#16A34A", "#EA580C",
  "#DB2777", "#2563EB", "#DC2626", "#9333EA", "#059669",
  "#0EA5E9", "#F59E0B", "#EC4899", "#10B981", "#8B5CF6",
];

export function colorForUserId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function displayNameFor(user: AuthkitUser): string {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.email) return user.email.split("@")[0];
  return "Student";
}

// Returns the current participant — an authenticated WorkOS user when one
// exists, otherwise an anonymous guest identified by a long-lived cookie.
// Used by the chat API and the chat room page so testing works out of the
// box without requiring a WorkOS account.
export async function getParticipantReadOnly(): Promise<Participant | null> {
  const auth = await getAuthState();
  if (auth.user) {
    return {
      kind: "user",
      id: auth.user.id,
      name: displayNameFor(auth.user),
      email: auth.user.email,
      avatarColor: colorForUserId(auth.user.id),
      profilePictureUrl: auth.user.profilePictureUrl,
    };
  }
  const guest = await readGuest();
  if (!guest) return null;
  return {
    kind: "guest",
    id: guest.id,
    name: guest.name,
    email: null,
    avatarColor: guest.avatarColor,
    profilePictureUrl: null,
  };
}

// Same as above, but creates and persists a guest identity if one doesn't
// exist yet. Only safe to call from Route Handlers / Server Actions, since
// it may write a cookie.
export async function getOrCreateParticipant(): Promise<Participant> {
  const auth = await getAuthState();
  if (auth.user) {
    return {
      kind: "user",
      id: auth.user.id,
      name: displayNameFor(auth.user),
      email: auth.user.email,
      avatarColor: colorForUserId(auth.user.id),
      profilePictureUrl: auth.user.profilePictureUrl,
    };
  }
  const guest = await getOrCreateGuest();
  return {
    kind: "guest",
    id: guest.id,
    name: guest.name,
    email: null,
    avatarColor: guest.avatarColor,
    profilePictureUrl: null,
  };
}
