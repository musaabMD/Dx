"use client";

import type { Channel } from "../types";
import { api } from "../lib/api";

export function ChannelsTable({ channels }: { channels: Channel[] }) {
  async function toggle(channel: Channel) {
    await api.toggleChannel(channel.id, channel.enabled ? 0 : 1);
    window.location.reload();
  }

  async function run(channel: Channel) {
    await api.runChannel(channel.id);
    window.location.reload();
  }

  return (
    <div className="card overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-amber-50 text-left text-xs uppercase tracking-wide text-amber-900">
          <tr>
            <th className="px-3 py-2">Handle</th>
            <th className="px-3 py-2">Label</th>
            <th className="px-3 py-2">Exam</th>
            <th className="px-3 py-2">Enabled</th>
            <th className="px-3 py-2">Last Run</th>
            <th className="px-3 py-2">Last Error</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel) => (
            <tr key={channel.id} className="border-t border-amber-100">
              <td className="px-3 py-2 font-medium">
                <a className="text-amber-800 underline" href={`/channels/${channel.id}`}>
                  @{channel.handle}
                </a>
              </td>
              <td className="px-3 py-2">{channel.label}</td>
              <td className="px-3 py-2">{channel.exam}</td>
              <td className="px-3 py-2">{channel.enabled ? "Yes" : "No"}</td>
              <td className="px-3 py-2">{channel.lastRunAt ? new Date(channel.lastRunAt).toLocaleString() : "Never"}</td>
              <td className="px-3 py-2 text-red-700">{channel.lastError ?? "-"}</td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <button className="btn-subtle" onClick={() => toggle(channel)}>
                    {channel.enabled ? "Disable" : "Enable"}
                  </button>
                  <button className="btn-primary" onClick={() => run(channel)}>
                    Run
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {channels.length === 0 ? (
            <tr>
              <td className="px-3 py-5 text-center text-slate-500" colSpan={7}>
                No channels yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
