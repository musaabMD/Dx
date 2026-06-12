"use server";

import { redirect } from "next/navigation";
import { createAgent, deleteAgent, normalizeAgentInput, updateAgent } from "./agents";

export async function createAgentAction(formData: FormData) {
  const agent = await createAgent(normalizeAgentInput(formData));
  redirect(`/agents/${agent.id}`);
}

export async function updateAgentAction(id: string, formData: FormData) {
  await updateAgent(id, normalizeAgentInput(formData));
  redirect(`/agents/${id}`);
}

export async function deleteAgentAction(id: string, _formData?: FormData) {
  await deleteAgent(id);
  redirect("/dashboard");
}
