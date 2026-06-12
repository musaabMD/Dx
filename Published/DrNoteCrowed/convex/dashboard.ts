import { query } from "./_generated/server";
import { v } from "convex/values";
import { dayKey, getCurrentUser } from "./lib";

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export const overview = query({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_exam_active", q => q.eq("examId", args.examId).eq("active", true))
      .collect();

    const subjectCount = new Set(questions.map(q => q.subject)).size;
    const tagCount = new Set(questions.flatMap(q => q.tags)).size;
    const libraryCount = (
      await ctx.db
        .query("libraryItems")
        .withIndex("by_exam", q => q.eq("examId", args.examId))
        .collect()
    ).length;
    const globalNotesCount = (
      await ctx.db
        .query("notes")
        .withIndex("by_exam", q => q.eq("examId", args.examId))
        .collect()
    ).length;

    if (!user) {
      return {
        subjectCount,
        tagCount,
        readyMocks: questions.length >= 20 ? 1 : 0,
        reviewCount: 0,
        flaggedCount: 0,
        incorrectCount: 0,
        correctCount: 0,
        accuracy: 0,
        activeSessions: 0,
        notesCount: globalNotesCount,
        libraryCount,
        aiAskCount: 0,
        questionsAnswered: 0,
        streak: 0,
        rank: null as number | null,
        estimatedScore: 0,
      };
    }

    const [allAnswers, allReviews, allSessions, allAiUsages, notes] = await Promise.all([
      ctx.db
        .query("answers")
        .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId))
        .collect(),
      ctx.db
        .query("reviews")
        .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId))
        .collect(),
      ctx.db
        .query("sessions")
        .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId))
        .collect(),
      ctx.db
        .query("aiUsages")
        .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId))
        .collect(),
      ctx.db.query("notes").withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId)).collect(),
    ]);

    const answers = allAnswers;
    const reviews = allReviews;
    const sessions = allSessions;
    const aiUsages = allAiUsages;

    const correct = answers.filter(a => a.correct).length;
    const accuracy = percent(correct, answers.length);
    const activeSessions = sessions.filter(s => s.status === "active").length;
    const flaggedCount = reviews.filter(r => r.status === "flagged").length;
    const incorrectCount = reviews.filter(r => r.status === "incorrect").length;
    const correctCount = reviews.filter(r => r.status === "correct").length;
    const uniqueDays = new Set(
      answers.map(a => new Date(a.answeredAt).toISOString().slice(0, 10))
    ).size;

    return {
      subjectCount,
      tagCount,
      readyMocks: questions.length >= 20 ? 1 : 0,
      reviewCount: reviews.length,
      flaggedCount,
      incorrectCount,
      correctCount,
      accuracy,
      activeSessions,
      notesCount: notes.length,
      libraryCount,
      aiAskCount: aiUsages.length,
      questionsAnswered: answers.length,
      streak: uniqueDays,
      rank: answers.length ? Math.max(1, 10 - Math.min(9, Math.floor(answers.length / 10))) : null,
      estimatedScore: accuracy,
    };
  },
});

export const topicMastery = query({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_exam", q => q.eq("examId", args.examId))
      .collect();

    const subjectTotals = new Map<string, { total: number; correct: number; answered: number }>();
    for (const question of questions) {
      const row = subjectTotals.get(question.subject) ?? { total: 0, correct: 0, answered: 0 };
      row.total += 1;
      subjectTotals.set(question.subject, row);
    }

    if (user) {
      const answers = await ctx.db
        .query("answers")
        .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId))
        .collect();
      const questionCache = new Map<string, { examId: string; subject: string }>();
      for (const answer of answers) {
        const key = String(answer.questionId);
        const cached = questionCache.get(key);
        const question = cached
          ? { examId: cached.examId, subject: cached.subject }
          : await ctx.db.get(answer.questionId);
        if (!question || question.examId !== args.examId) continue;

        if (!cached) {
          questionCache.set(key, {
            examId: question.examId,
            subject: question.subject,
          });
        }

        const row = subjectTotals.get(question.subject) ?? { total: 0, correct: 0, answered: 0 };
        row.answered += 1;
        if (answer.correct) row.correct += 1;
        subjectTotals.set(question.subject, row);
      }
    }

    return [...subjectTotals.entries()]
      .map(([topic, row]) => ({
        topic,
        mastery: row.answered ? percent(row.correct, row.answered) : 0,
        answered: row.answered,
        total: row.total,
      }))
      .sort((a, b) => b.answered - a.answered || a.topic.localeCompare(b.topic));
  },
});

export const leaderboard = query({
  args: { windowDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const days = Math.min(14, Math.max(1, args.windowDays ?? 7));
    const weekSet = new Set<string>();
    for (let i = 0; i < days; i += 1) {
      weekSet.add(dayKey(Date.now() - i * 86_400_000));
    }

    const people = await ctx.db.query("users").collect();
    const rows = (
      await Promise.all(people.map(async person => {
        const usageRows = await ctx.db
          .query("usageDays")
          .withIndex("by_user_day", q => q.eq("userId", person._id))
          .collect();
        const xp = usageRows.reduce((sum, entry) => (
          weekSet.has(entry.day) ? sum + entry.questionsAnswered : sum
        ), 0);
        if (!xp) return null;
        const rawName = person.name?.trim() || person.email?.split("@")[0] || "Learner";
        const name = rawName.length > 18 ? `${rawName.slice(0, 15)}…` : rawName;
        return {
          userId: String(person._id),
          name,
          xp,
          isCurrentUser: person._id === currentUser._id,
        };
      }))
    )
      .filter((row): row is { userId: string; name: string; xp: number; isCurrentUser: boolean } => Boolean(row))
      .sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    return rows;
  },
});
