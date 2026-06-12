import Link from "next/link";
import { Bot, Braces, Code2, FlaskConical, Globe2, MoreHorizontal, Pencil, Play, Plus, Rocket, Trash2 } from "lucide-react";
import type { Agent } from "@/lib/agents";
import { deleteAgentAction } from "@/lib/actions";

export function AgentList({ agents }: { agents: Agent[] }) {
  if (agents.length === 0) {
    return (
      <div className="list empty">
        <h2>No agents yet</h2>
        <p className="hint">Create your first text agent, test it, then use the generated endpoint or public page.</p>
        <Link className="button primary" href="/agents/new">
          <Plus size={18} /> New Agent
        </Link>
      </div>
    );
  }

  return (
    <div className="list">
      {agents.map((agent) => (
        <article className="agent-row" key={agent.id}>
          <div className="agent-main">
            <span className="agent-icon">
              <Bot size={25} />
            </span>
            <div>
              <h2 className="agent-name">{agent.name}</h2>
              <p className="agent-desc">{agent.description || "No description yet"}</p>
            </div>
          </div>
          <div>
            <strong>{agent.model}</strong>
            <div className="meta">{agent.provider} · {agent.inputType} to {agent.outputFormat}</div>
          </div>
          <span className="status-pill">
            <Braces size={17} /> API ready
          </span>
          <div className="actions">
            <Link className="button" href={`/agents/${agent.id}`}>
              <Pencil size={17} /> Edit
            </Link>
            <Link className="button" href={`/agents/${agent.id}/test`}>
              <Play size={17} /> Test
            </Link>
            <Link className="button" href={`/agents/${agent.id}/deploy`}>
              <Rocket size={17} /> Deploy
            </Link>
            <Link className="button icon" href={`/a/${agent.id}`} title="Public page">
              <Globe2 size={17} />
            </Link>
            <span className="button icon" title="More">
              <MoreHorizontal size={18} />
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function AgentForm({
  action,
  agent,
  submitLabel = "Save Agent"
}: {
  action: (formData: FormData) => void;
  agent?: Agent;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="panel">
      <div className="form-grid">
        <Field label="Agent Name" name="name" defaultValue={agent?.name} placeholder="PDF Invoice Extractor" />
        <Field label="Model" name="model" defaultValue={agent?.model || "gpt-4o-mini"} placeholder="gpt-4o-mini" />
        <div className="field full">
          <label className="label" htmlFor="description">Description</label>
          <input className="input" id="description" name="description" defaultValue={agent?.description} placeholder="Extract invoice fields from pasted text." />
        </div>
        <Select label="LLM Provider" name="provider" defaultValue={agent?.provider || "openai"} options={["openai", "huggingface", "custom"]} />
        <Select label="Input Type" name="inputType" defaultValue={agent?.inputType || "text"} options={["text", "pdf"]} />
        <Select label="Output Format" name="outputFormat" defaultValue={agent?.outputFormat || "text"} options={["text", "json", "markdown"]} />
        <div className="field full">
          <label className="label" htmlFor="systemPrompt">System Prompt</label>
          <textarea className="textarea" id="systemPrompt" name="systemPrompt" defaultValue={agent?.systemPrompt} placeholder="You are a focused AI agent that..." />
        </div>
        <div className="field full">
          <label className="label" htmlFor="rules">Rules</label>
          <textarea className="textarea" id="rules" name="rules" defaultValue={agent?.rules} placeholder="Keep answers short. Return valid JSON. Do not invent missing values." />
        </div>
      </div>
      <div className="actions" style={{ marginTop: 18 }}>
        {agent ? (
          <button className="button danger" formAction={deleteAgentAction.bind(null, agent.id)}>
            <Trash2 size={17} /> Delete
          </button>
        ) : null}
        <button className="button primary" type="submit">
          <Code2 size={17} /> {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="field">
      <label className="label" htmlFor={name}>{label}</label>
      <input className="input" id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} required={name === "name"} />
    </div>
  );
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return (
    <div className="field">
      <label className="label" htmlFor={name}>{label}</label>
      <select className="select" id={name} name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export function AgentNav({ agent }: { agent: Agent }) {
  return (
    <div className="tabs">
      <Link className="button" href={`/agents/${agent.id}`}>
        <Pencil size={17} /> Builder
      </Link>
      <Link className="button" href={`/agents/${agent.id}/test`}>
        <FlaskConical size={17} /> Test
      </Link>
      <Link className="button" href={`/agents/${agent.id}/deploy`}>
        <Rocket size={17} /> Deploy
      </Link>
      <Link className="button" href={`/a/${agent.id}`}>
        <Globe2 size={17} /> Public Page
      </Link>
    </div>
  );
}
