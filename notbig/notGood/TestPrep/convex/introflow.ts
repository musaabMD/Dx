import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getIntroText = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("introflow")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();

    const active = rows.find((r) => r.isActive);
    return active?.text ?? "Sign in to get started";
  },
});

export const seedIntroflow = mutation({
  args: {},
  handler: async (ctx) => {
    const signupExisting = await ctx.db
      .query("introflow")
      .withIndex("by_key", (q) => q.eq("key", "signup_subtitle"))
      .first();

    if (!signupExisting) {
      await ctx.db.insert("introflow", {
        key: "signup_subtitle",
        text: "Crack your next exam with focused daily practice.",
        isActive: true,
      });
    }

    const introRows = await ctx.db.query("introflow").collect();
    const existingIntroRows = introRows.filter((r) => r.key.startsWith("intro_page_"));
    for (const row of existingIntroRows) {
      await ctx.db.delete(row._id);
    }

    const pages = [
      { title: "Smart Practice", subtitle: "Target weak areas first and improve faster." },
      { title: "Daily Streak", subtitle: "Stay consistent with smart reminders." },
      { title: "Subject Analytics", subtitle: "Track progress by every subject." },
      { title: "Topic Breakdown", subtitle: "See exactly where you lose marks." },
      { title: "Tag-Based Practice", subtitle: "Practice by tags like cardio, ethics, pharma." },
      { title: "Review Wrong Answers", subtitle: "Retry incorrect questions until mastery." },
      { title: "Flag + Bookmark", subtitle: "Save high-yield and hard questions quickly." },
      { title: "One-Line HY Summary", subtitle: "Revise fast before exam day." },
      { title: "Mock + Rank", subtitle: "Compete with others and track your rank." },
      { title: "Exam Ready", subtitle: "Finish strong with focused revision flow." },
    ];

    for (let i = 0; i < pages.length; i += 1) {
      await ctx.db.insert("introflow", {
        key: `intro_page_${i + 1}`,
        title: pages[i].title,
        subtitle: pages[i].subtitle,
        position: i + 1,
        isActive: true,
      });
    }

    return { seededPages: pages.length };
  },
});

export const getIntroPages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("introflow").collect();
    return rows
      .filter((r) => r.isActive && r.key.startsWith("intro_page_"))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((r) => ({
        title: r.title ?? "Feature",
        subtitle: r.subtitle ?? "",
      }));
  },
});
