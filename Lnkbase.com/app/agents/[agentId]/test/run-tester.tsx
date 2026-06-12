"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function RunTester({ agentId }: { agentId: string }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(`/api/agents/${agentId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      });
      const json = await response.json();
      setResult(json.output || json.error || "No output returned.");
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <section className="panel">
        <label className="label" htmlFor="input">Input</label>
        <textarea className="textarea" id="input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste a message, invoice text, support request, or task here." />
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="button primary" type="button" onClick={run} disabled={loading || !input.trim()}>
            <Play size={17} /> {loading ? "Running" : "Run Agent"}
          </button>
        </div>
      </section>
      <aside className="panel">
        <h2 style={{ marginTop: 0 }}>Result</h2>
        <div className="code result">{result || "The agent response will appear here."}</div>
      </aside>
    </div>
  );
}
