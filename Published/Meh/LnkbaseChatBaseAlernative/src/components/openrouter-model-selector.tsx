"use client";

import { Check, ChevronsUpDown, Loader2, Network, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type OpenRouterModel = {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
};

const fallbackModel: OpenRouterModel = {
  id: "openai/gpt-4.1-mini",
  name: "GPT-4.1 mini",
  context_length: 1047576,
};

export function OpenRouterModelSelector({
  agentId,
  currentModel,
}: {
  agentId?: string;
  currentModel?: string;
}) {
  const [models, setModels] = useState<OpenRouterModel[]>([fallbackModel]);
  const [selectedModel, setSelectedModel] = useState(
    currentModel ?? fallbackModel.id
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      setLoading(true);
      try {
        const response = await fetch("/api/openrouter/models");
        const data = (await response.json()) as { models?: OpenRouterModel[] };
        if (!cancelled && data.models?.length) {
          setModels(mergeCurrentModel(data.models, currentModel ?? fallbackModel.id));
        }
      } catch {
        if (!cancelled) {
          setModels(mergeCurrentModel([fallbackModel], currentModel ?? fallbackModel.id));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [currentModel]);

  const selected = useMemo(
    () => models.find((model) => model.id === selectedModel) ?? fallbackModel,
    [models, selectedModel]
  );

  async function saveModel(modelId = selectedModel) {
    if (!agentId) {
      setMessage("Create an agent before saving a model.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/agents/${agentId}/model`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save model");
      }

      setMessage("Saved from OpenRouter.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save model");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardLabel>Model</CardLabel>
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-full bg-[#f0efff] text-[#5b4dff]"
            >
              <Network size={13} />
              OpenRouter
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the model this agent uses for embedded chats.
          </p>
        </div>
        <Dialog>
          <DialogTrigger className="inline-flex h-7 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium transition hover:bg-muted">
            Compare
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compare OpenRouter models</DialogTitle>
              <DialogDescription>
                Pick one model for this agent. Pricing is shown per million
                tokens when OpenRouter returns pricing data.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {models.slice(0, 6).map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={cn(
                    "rounded-xl border bg-white p-4 text-left transition hover:border-[#6b5cff] hover:bg-[#fbfbff]",
                    model.id === selectedModel
                      ? "border-[#6b5cff] ring-2 ring-[#6b5cff]/15"
                      : "border-border"
                  )}
                  onClick={() => {
                    setSelectedModel(model.id);
                    saveModel(model.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#15151a]">
                        {model.name ?? prettifyModelId(model.id)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {model.id}
                      </p>
                    </div>
                    {model.id === selectedModel && (
                      <Check className="text-[#6b5cff]" size={18} />
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ModelMeta model={model} />
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <label className="relative block">
        <span className="sr-only">OpenRouter model</span>
        <select
          value={selectedModel}
          disabled={loading || saving}
          onChange={(event) => {
            setSelectedModel(event.target.value);
            saveModel(event.target.value);
          }}
          className="h-12 w-full appearance-none rounded-xl border border-border bg-white px-4 pr-10 text-sm font-semibold text-[#101015] outline-none transition focus:border-[#6b5cff] focus:ring-4 focus:ring-[#6b5cff]/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {(model.name ?? prettifyModelId(model.id)) + " · " + model.id}
            </option>
          ))}
        </select>
        <ChevronsUpDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={17}
        />
      </label>

      <div className="rounded-xl border border-border bg-[#fafafa] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15151a]">
              {selected.name ?? prettifyModelId(selected.id)}
            </p>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              {selected.id}
            </p>
          </div>
          {loading || saving ? (
            <Loader2 className="animate-spin text-muted-foreground" size={17} />
          ) : (
            <Sparkles className="text-[#6b5cff]" size={17} />
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ModelMeta model={selected} />
        </div>
      </div>

      {message && (
        <p
          className={cn(
            "text-xs font-medium",
            message.toLowerCase().includes("failed") ||
              message.toLowerCase().includes("create")
              ? "text-destructive"
              : "text-emerald-700"
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function ModelMeta({ model }: { model: OpenRouterModel }) {
  return (
    <>
      <Badge variant="outline">
        {model.context_length
          ? `${Math.round(model.context_length / 1000).toLocaleString()}k context`
          : "Context varies"}
      </Badge>
      <Badge variant="outline">{formatPricing(model.pricing?.prompt, "input")}</Badge>
      <Badge variant="outline">
        {formatPricing(model.pricing?.completion, "output")}
      </Badge>
    </>
  );
}

function CardLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-[#101015]">{children}</h2>;
}

function mergeCurrentModel(models: OpenRouterModel[], selectedModel: string) {
  if (models.some((model) => model.id === selectedModel)) return models;
  return [{ id: selectedModel, name: prettifyModelId(selectedModel) }, ...models];
}

function prettifyModelId(id: string) {
  const name = id.split("/").at(-1) ?? id;
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPricing(value: string | undefined, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return `${label} pricing varies`;
  return `$${(parsed * 1_000_000).toFixed(2)} / 1M ${label}`;
}
