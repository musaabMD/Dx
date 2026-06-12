"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function PublicAgent({ agentId }: { agentId: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setOutput("");

    try {
      const response = await fetch(`/api/agents/${agentId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      });
      const json = await response.json();
      setOutput(json.output || json.error || "No output returned.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <label className="label" htmlFor="public-input">Message</label>
      <textarea className="textarea" id="public-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a message for this agent." />
      <div className="actions" style={{ margin: "16px 0" }}>
        <button className="button primary" type="button" onClick={submit} disabled={loading || !input.trim()}>
          <Send size={17} /> {loading ? "Running" : "Send"}
        </button>
      </div>
      <div className="code result">{output || "The response will appear here."}</div>
    </>
  );
}
