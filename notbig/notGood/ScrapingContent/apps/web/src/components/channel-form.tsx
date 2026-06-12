"use client";

import { useState } from "react";
import { api } from "../lib/api";

export function ChannelForm() {
  const [handle, setHandle] = useState("");
  const [label, setLabel] = useState("");
  const [exam, setExam] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createChannel({ handle, label, exam });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <h2 className="text-lg font-semibold">Add Channel</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="handle (e.g. foo_channel)" value={handle} onChange={(e) => setHandle(e.target.value)} required />
        <input className="input" placeholder="label" value={label} onChange={(e) => setLabel(e.target.value)} required />
        <input className="input" placeholder="exam tag" value={exam} onChange={(e) => setExam(e.target.value)} required />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Add Channel"}
      </button>
    </form>
  );
}
