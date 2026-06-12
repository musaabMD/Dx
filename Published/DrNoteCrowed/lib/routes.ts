export type DrNoteScreen =
  | "home"
  | "exam"
  | "subjects"
  | "tags"
  | "review"
  | "analysis"
  | "sessions"
  | "notes"
  | "library"
  | "ask"
  | "practice"
  | "mock"
  | "report";

export type DrNoteTab = "learn" | "features" | "leaderboard" | "profile";

export type DrNoteRouteState = {
  screen: DrNoteScreen;
  tab: DrNoteTab;
  examId?: string;
};

export const examRouteScreens = [
  "subjects",
  "tags",
  "review",
  "analysis",
  "sessions",
  "notes",
  "library",
  "ask",
  "practice",
  "mock",
  "report",
] as const satisfies readonly DrNoteScreen[];

export function isExamRouteScreen(value: string | undefined): value is (typeof examRouteScreens)[number] {
  return Boolean(value && (examRouteScreens as readonly string[]).includes(value));
}

export function routeForHomeTab(tab: DrNoteTab) {
  if (tab === "features") return "/features";
  if (tab === "leaderboard") return "/leaderboard";
  if (tab === "profile") return "/profile";
  return "/";
}

export function routeForScreen(screen: DrNoteScreen, examId: string, tab: DrNoteTab = "learn") {
  if (screen === "home") return routeForHomeTab(tab);
  const encodedExamId = encodeURIComponent(examId);
  if (screen === "exam") return `/exams/${encodedExamId}`;
  return `/exams/${encodedExamId}/${screen}`;
}

export function routeStateFromPath(pathname: string): DrNoteRouteState {
  const rawParts = pathname.split("/").filter(Boolean);
  const parts = [] as string[];

  for (const part of rawParts) {
    try {
      parts.push(decodeURIComponent(part));
    } catch {
      return { screen: "home", tab: "learn" };
    }
  }

  if (parts.length === 0) return { screen: "home", tab: "learn" };
  if (parts.length === 1 && parts[0] === "features") {
    return { screen: "home", tab: "features" };
  }
  if (parts.length === 1 && parts[0] === "leaderboard") {
    return { screen: "home", tab: "leaderboard" };
  }
  if (parts.length === 1 && parts[0] === "profile") {
    return { screen: "home", tab: "profile" };
  }
  if (parts[0] === "exams" && parts[1]) {
    if (parts.length === 2) {
      return { screen: "exam", tab: "learn", examId: parts[1] };
    }
    if (parts.length === 3 && isExamRouteScreen(parts[2])) {
      return { screen: parts[2], tab: "learn", examId: parts[1] };
    }
  }

  return { screen: "home", tab: "learn" };
}
