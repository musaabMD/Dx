import { EXAMS } from "@/lib/exams";
import { formatMembers, getLiveCount } from "@/lib/store";
import { ExamGrid } from "@/components/ExamGrid";
import { AuthHeader } from "@/components/AuthHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  colorForUserId,
  displayNameFor,
  getAuthState,
  getSignInUrl,
  getSignUpUrl,
} from "@/lib/auth";
import { readGuest } from "@/lib/guest";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initial = EXAMS.map((e) => ({
    slug: e.slug,
    name: e.name,
    shortName: e.shortName,
    iconLabel: e.iconLabel,
    category: e.category,
    description: e.description,
    accent: e.accent,
    members: e.baseMembers,
    membersLabel: formatMembers(e.baseMembers),
    live: getLiveCount(e.slug, e.baseMembers),
  }));

  const auth = await getAuthState();
  const guest = auth.user ? null : await readGuest();
  const [signInUrl, signUpUrl] = await Promise.all([
    auth.user ? Promise.resolve("") : getSignInUrl(),
    auth.user ? Promise.resolve("") : getSignUpUrl(),
  ]);

  const headerUser = auth.user
    ? {
        kind: "user" as const,
        id: auth.user.id,
        name: displayNameFor(auth.user),
        email: auth.user.email,
        avatarColor: colorForUserId(auth.user.id),
        profilePictureUrl: auth.user.profilePictureUrl,
      }
    : guest
      ? {
          kind: "guest" as const,
          id: guest.id,
          name: guest.name,
          email: null,
          avatarColor: guest.avatarColor,
          profilePictureUrl: null,
        }
      : null;

  return (
    <div className="flex-1 bg-[var(--surface)] text-[var(--surface-fg)]">
      <header className="safe-top sticky top-0 z-20 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg)]">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 grid place-items-center text-base font-bold text-white">
              E
            </div>
            <div className="font-semibold tracking-tight truncate text-[var(--chrome-fg)]">
              ExamChat
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle className="text-[var(--chrome-fg)]/80 hover:bg-[var(--menu-hover)]" />
            <AuthHeader
              user={headerUser}
              signInUrl={signInUrl}
              signUpUrl={signUpUrl}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:pt-14">
        <section className="mb-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--surface-fg)]">
            Pick your exam
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-[var(--surface-muted)]">
            Drop into a live room. Real students. Right now.
          </p>
        </section>

        <ExamGrid initial={initial} />

        <p className="mt-10 text-center text-[11px] text-[var(--surface-subtle)]">
          ExamChat is a study community. Don&apos;t share copyrighted material.
        </p>
      </main>
    </div>
  );
}
