import { cookies } from "next/headers";

export type Guest = {
  id: string;
  name: string;
  avatarColor: string;
};

const COOKIE_NAME = "examchat_guest";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const ADJECTIVES = [
  "Sleepy", "Caffeinated", "Quiet", "Brilliant", "Tired", "Hopeful",
  "Curious", "Focused", "Frantic", "Stoic", "Diligent", "Witty",
  "Mighty", "Wandering", "Stubborn", "Gentle", "Fierce", "Sneaky",
  "Lucky", "Steady", "Patient", "Bold",
];

const ANIMALS = [
  "Otter", "Capybara", "Falcon", "Lemur", "Penguin", "Wolf", "Fox",
  "Owl", "Hawk", "Beaver", "Rabbit", "Lynx", "Heron", "Stoat", "Badger",
  "Cobra", "Manatee", "Koala", "Tapir", "Raven", "Bison", "Marlin",
];

const COLORS = [
  "#E11D48", "#7C3AED", "#0891B2", "#16A34A", "#EA580C",
  "#DB2777", "#2563EB", "#DC2626", "#9333EA", "#059669",
  "#0EA5E9", "#F59E0B", "#EC4899", "#10B981", "#8B5CF6",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomId(): string {
  return (
    "g_" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
}

function encode(g: Guest): string {
  return Buffer.from(JSON.stringify(g)).toString("base64url");
}

function decode(raw: string): Guest | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as Guest;
    if (parsed.id && parsed.name && parsed.avatarColor) return parsed;
    return null;
  } catch {
    return null;
  }
}

// Read the current guest identity, if any. Does NOT mutate cookies — safe to
// call from both Server Components and Route Handlers.
export async function readGuest(): Promise<Guest | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decode(raw);
}

// Get-or-create the guest. Sets a cookie when called from a Route Handler /
// Server Action context. Server Components can't write cookies, so callers
// from those contexts should use `readGuest()` and let an action create one.
export async function getOrCreateGuest(): Promise<Guest> {
  const existing = await readGuest();
  if (existing) return existing;
  const fresh: Guest = {
    id: randomId(),
    name: `${pick(ADJECTIVES)}${pick(ANIMALS)}`,
    avatarColor: pick(COLORS),
  };
  try {
    const store = await cookies();
    store.set({
      name: COOKIE_NAME,
      value: encode(fresh),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  } catch {
    // Server Component — can't set cookies. The route handler will set on POST.
  }
  return fresh;
}
