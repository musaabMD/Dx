import { notFound } from "next/navigation";
import { ProgressTable } from "../../../components/progress-table";
import { RecentPosts } from "../../../components/recent-posts";
import { api } from "../../../lib/api";

export default async function ChannelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const progress = await api.channelProgress(id);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const posts = await api.listPosts(id, currentMonth);

    return (
      <section className="space-y-6">
        <header className="card p-4">
          <p className="text-xs uppercase tracking-wide text-amber-800">Channel</p>
          <h1 className="text-2xl font-bold text-amber-900">@{progress.channel.handle} · {progress.channel.label}</h1>
          <p className="text-sm text-slate-700">Exam: {progress.channel.exam}</p>
          <div className="mt-3 flex gap-3 text-xs text-slate-600">
            <span>Last run: {progress.lastRun.startedAt ? new Date(progress.lastRun.startedAt).toLocaleString() : "Never"}</span>
            <span>Mode: {progress.lastRun.mode ?? "-"}</span>
            <span className="text-red-700">{progress.lastRun.error ?? ""}</span>
          </div>
        </header>

        <ProgressTable progress={progress} />
        <RecentPosts posts={posts} />
      </section>
    );
  } catch {
    notFound();
  }
}
