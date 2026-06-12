import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./lib";

export const list = query({
  args: {
    examId: v.string(),
    subject: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const base = args.subject
      ? ctx.db
          .query("questions")
          .withIndex("by_exam_subject", q =>
            q.eq("examId", args.examId).eq("subject", args.subject!)
          )
      : ctx.db.query("questions").withIndex("by_exam", q => q.eq("examId", args.examId));

    return await base
      .filter(q => q.eq(q.field("active"), true))
      .take(limit);
  },
});

export const countByExam = query({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_exam_active", q => q.eq("examId", args.examId).eq("active", true))
      .collect();
    return questions.length;
  },
});

export const tagStatusCounts = query({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    const norm = (tag: string) => tag.trim().toLowerCase();
    const bucketByTag = new Map<
      string,
      {
        tag: string;
        total: number;
        used: number;
        unused: number;
        incorrect: number;
        flagged: number;
      }
    >();
    const tagsByQuestion = new Map<string, string[]>();

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_exam_active", q => q.eq("examId", args.examId).eq("active", true))
      .collect();

    for (const question of questions) {
      const tags = [...new Set(question.tags.map(norm).filter(Boolean))];
      tagsByQuestion.set(String(question._id), tags);
      for (const tag of tags) {
        const bucket = bucketByTag.get(tag);
        if (!bucket) {
          bucketByTag.set(tag, {
            tag,
            total: 0,
            used: 0,
            unused: 0,
            incorrect: 0,
            flagged: 0,
          });
        }
        const current = bucketByTag.get(tag);
        if (!current) continue;
        current.total += 1;
        current.unused += 1;
      }
    }

    const user = await getCurrentUser(ctx);
    if (!user) {
      return [...bucketByTag.values()];
    }

    const userReviews = await ctx.db
      .query("reviews")
      .withIndex("by_user_exam", q =>
        q.eq("userId", user._id).eq("examId", args.examId)
      )
      .order("desc")
      .collect();

    const seenQuestionIds = new Set<string>();

    for (const review of userReviews) {
      const questionId = String(review.questionId);
      if (seenQuestionIds.has(questionId)) continue;
      seenQuestionIds.add(questionId);

      const reviewTags = tagsByQuestion.get(questionId);
      if (!reviewTags || reviewTags.length === 0) continue;

      for (const tag of reviewTags) {
        const bucket = bucketByTag.get(tag);
        if (!bucket) continue;

        if (bucket.unused > 0) {
          bucket.unused -= 1;
        }
        bucket.used += 1;

        if (review.status === "incorrect") bucket.incorrect += 1;
        if (review.status === "flagged") bucket.flagged += 1;
      }
    }

    return [...bucketByTag.values()];
  },
});
