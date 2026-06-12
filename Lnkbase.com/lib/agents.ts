import { promises as fs } from "fs";
import path from "path";

export type AgentProvider = "openai" | "huggingface" | "custom";
export type InputType = "text" | "pdf";
export type OutputFormat = "text" | "json" | "markdown";

export type Agent = {
  id: string;
  name: string;
  description: string;
  provider: AgentProvider;
  model: string;
  systemPrompt: string;
  inputType: InputType;
  outputFormat: OutputFormat;
  rules: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentInput = Omit<Agent, "id" | "createdAt" | "updatedAt">;

const DATA_FILE = path.join(process.cwd(), "data", "agents.json");

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || `agent-${Date.now()}`;
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function getAgents(): Promise<Agent[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as Agent[];
}

export async function getAgent(id: string): Promise<Agent | undefined> {
  const agents = await getAgents();
  return agents.find((agent) => agent.id === id);
}

async function saveAgents(agents: Agent[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, `${JSON.stringify(agents, null, 2)}\n`, "utf8");
}

export async function createAgent(input: AgentInput): Promise<Agent> {
  const agents = await getAgents();
  const baseId = slugify(input.name);
  let id = baseId;
  let counter = 2;

  while (agents.some((agent) => agent.id === id)) {
    id = `${baseId}-${counter}`;
    counter += 1;
  }

  const now = new Date().toISOString();
  const agent: Agent = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now
  };

  await saveAgents([agent, ...agents]);
  return agent;
}

export async function updateAgent(id: string, input: AgentInput): Promise<Agent | undefined> {
  const agents = await getAgents();
  const index = agents.findIndex((agent) => agent.id === id);

  if (index === -1) {
    return undefined;
  }

  const nextAgent = {
    ...agents[index],
    ...input,
    updatedAt: new Date().toISOString()
  };

  agents[index] = nextAgent;
  await saveAgents(agents);
  return nextAgent;
}

export async function deleteAgent(id: string) {
  const agents = await getAgents();
  await saveAgents(agents.filter((agent) => agent.id !== id));
}

export function normalizeAgentInput(formData: FormData): AgentInput {
  return {
    name: String(formData.get("name") || "Untitled Agent"),
    description: String(formData.get("description") || ""),
    provider: String(formData.get("provider") || "openai") as AgentProvider,
    model: String(formData.get("model") || "gpt-4o-mini"),
    systemPrompt: String(formData.get("systemPrompt") || ""),
    inputType: String(formData.get("inputType") || "text") as InputType,
    outputFormat: String(formData.get("outputFormat") || "text") as OutputFormat,
    rules: String(formData.get("rules") || "")
  };
}
