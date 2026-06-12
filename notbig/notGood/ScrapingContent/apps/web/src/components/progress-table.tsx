import type { ChannelProgressResponse } from "../types";

export function ProgressTable({ progress }: { progress: ChannelProgressResponse }) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-amber-50 text-left text-xs uppercase tracking-wide text-amber-900">
          <tr>
            <th className="px-3 py-2">Month</th>
            <th className="px-3 py-2">Coverage</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Text</th>
            <th className="px-3 py-2">Images</th>
            <th className="px-3 py-2">Files</th>
          </tr>
        </thead>
        <tbody>
          {progress.months.map((month) => (
            <tr key={month.monthKey} className="border-t border-amber-100">
              <td className="px-3 py-2 font-medium">{month.monthKey}</td>
              <td className="px-3 py-2">
                <div className="h-2 w-40 rounded bg-amber-100">
                  <div className="h-2 rounded bg-amber-700" style={{ width: `${Math.min(month.coveragePct, 100)}%` }} />
                </div>
                <span className="text-xs text-slate-600">{month.coveragePct}%</span>
              </td>
              <td className="px-3 py-2">{month.totalPosts}</td>
              <td className="px-3 py-2">{month.textPosts}</td>
              <td className="px-3 py-2">{month.images}</td>
              <td className="px-3 py-2">{month.files}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
