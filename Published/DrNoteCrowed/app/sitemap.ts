import type { MetadataRoute } from "next";
import { exams, siteConfig } from "@/lib/seo";
import { examRouteScreens, routeForScreen } from "@/lib/routes";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/features", priority: 0.7 },
  { path: "/leaderboard", priority: 0.5 },
  { path: "/profile", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const examRoutes = exams.flatMap(exam => [
    {
      url: new URL(routeForScreen("exam", exam.id), siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...examRouteScreens.map(screen => ({
      url: new URL(routeForScreen(screen, exam.id), siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: screen === "practice" || screen === "mock" ? 0.8 : 0.7,
    })),
  ]);

  return [
    ...staticRoutes.map(route => ({
      url: new URL(route.path, siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...examRoutes,
  ];
}
