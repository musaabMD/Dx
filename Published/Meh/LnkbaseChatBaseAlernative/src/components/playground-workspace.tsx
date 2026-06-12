"use client";

import { Check, Eye, EyeOff, Palette, RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { OpenRouterModelSelector } from "@/components/openrouter-model-selector";
import {
  PlaygroundChatPreview,
  playgroundIconOptions,
  type PlaygroundFeature,
  type PlaygroundIconName,
} from "@/components/playground-chat-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlaygroundWorkspaceProps = {
  agentId?: string;
  agentName: string;
  agentStatus: string;
  currentModel?: string;
  instructions: string;
  suggestedQuestions?: string[];
  themeColor?: string;
  trainingSize: string;
  welcomeMessage?: string;
};

const useCaseOptions: Array<{
  key: PlaygroundFeature;
  label: string;
  description: string;
}> = [
  {
    key: "ticket",
    label: "Ticket intake",
    description: "Show support request forms in the widget.",
  },
  {
    key: "bugCapture",
    label: "Bug capture modes",
    description: "Show screenshot, desktop recording, and instant replay tools.",
  },
  {
    key: "help",
    label: "Help articles",
    description: "Show searchable docs and guides.",
  },
  {
    key: "feedback",
    label: "Feedback",
    description: "Let visitors leave product feedback.",
  },
  {
    key: "changelog",
    label: "Changelog",
    description: "Show recent product updates.",
  },
];

const displayOptions: Array<{
  key: PlaygroundFeature;
  label: string;
  description: string;
}> = [
  {
    key: "suggestedPrompts",
    label: "Suggested questions",
    description: "Show prompt shortcuts above the composer.",
  },
  {
    key: "sources",
    label: "Sources",
    description: "Let admins preview source attribution.",
  },
  {
    key: "voice",
    label: "Voice icon",
    description: "Show the microphone control.",
  },
  {
    key: "ratings",
    label: "Answer rating",
    description: "Show thumbs up and down actions.",
  },
  {
    key: "branding",
    label: "Branding",
    description: "Show the Powered by Lnkbase label.",
  },
];

const defaultFeatures: Record<PlaygroundFeature, boolean> = {
  ticket: true,
  bugCapture: true,
  help: true,
  feedback: true,
  changelog: true,
  suggestedPrompts: true,
  sources: true,
  voice: true,
  ratings: true,
  branding: true,
};

const colorOptions = ["#6256ff", "#2563eb", "#0f766e", "#dc2626", "#111827"];

export function PlaygroundWorkspace({
  agentId,
  agentName,
  agentStatus,
  currentModel,
  instructions,
  suggestedQuestions,
  themeColor = "#6256ff",
  trainingSize,
  welcomeMessage,
}: PlaygroundWorkspaceProps) {
  const [enabledFeatures, setEnabledFeatures] =
    useState<Record<PlaygroundFeature, boolean>>(defaultFeatures);
  const [iconName, setIconName] = useState<PlaygroundIconName>("bot");
  const [selectedColor, setSelectedColor] = useState(themeColor);

  const visibleUseCaseCount = useMemo(
    () => useCaseOptions.filter((item) => enabledFeatures[item.key]).length,
    [enabledFeatures]
  );

  function toggleFeature(feature: PlaygroundFeature) {
    setEnabledFeatures((current) => ({
      ...current,
      [feature]: !current[feature],
    }));
  }

  function resetAppearance() {
    setIconName("bot");
    setSelectedColor(themeColor);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <section className="rounded-2xl border border-black/[0.08] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{agentName}</p>
              <p className="mt-1 text-xs text-[#888890]">Single chatbot playground</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {agentStatus === "ready" ? "Trained" : agentStatus}
            </span>
          </div>
          <p className="mt-3 text-xs text-[#888890]">Last trained 1 minute ago · {trainingSize}</p>
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#6256ff]" />
            <p className="text-sm font-semibold">Use cases</p>
            <span className="ml-auto rounded-full bg-[#f1f1f4] px-2 py-0.5 text-xs font-semibold text-[#62626c]">
              {visibleUseCaseCount} on
            </span>
          </div>
          <div className="grid gap-2">
            {useCaseOptions.map((item) => (
              <FeatureCheck
                key={item.key}
                active={enabledFeatures[item.key]}
                description={item.description}
                label={item.label}
                onClick={() => toggleFeature(item.key)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Eye size={16} className="text-[#6256ff]" />
            <p className="text-sm font-semibold">Show or hide</p>
          </div>
          <div className="grid gap-2">
            {displayOptions.map((item) => (
              <FeatureCheck
                key={item.key}
                active={enabledFeatures[item.key]}
                description={item.description}
                label={item.label}
                onClick={() => toggleFeature(item.key)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-[#6256ff]" />
              <p className="text-sm font-semibold">Icon and color</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-[#888890]"
              aria-label="Reset appearance"
              onClick={resetAppearance}
            >
              <RefreshCcw size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {playgroundIconOptions.map((item) => {
              const Icon = item.icon;
              const active = iconName === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "grid min-h-16 justify-items-center gap-1 rounded-xl border px-2 py-2 text-xs font-semibold transition",
                    active
                      ? "border-[#6256ff] bg-[#f3f1ff] text-[#4f46e5]"
                      : "border-black/[0.08] text-[#5c5c66] hover:bg-black/[0.03]"
                  )}
                  onClick={() => setIconName(item.id)}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "grid size-8 place-items-center rounded-full border border-black/10",
                  selectedColor === color && "ring-2 ring-black/15 ring-offset-2"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Use ${color} theme color`}
                onClick={() => setSelectedColor(color)}
              >
                {selectedColor === color && <Check size={15} className="text-white" strokeWidth={3} />}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-[#666671]">
              Custom
              <input
                value={selectedColor}
                type="color"
                className="size-8 rounded-md border border-black/10 bg-transparent"
                aria-label="Custom theme color"
                onChange={(event) => setSelectedColor(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-4">
          <OpenRouterModelSelector agentId={agentId} currentModel={currentModel} />
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Instructions</p>
            <button
              className="grid size-7 place-items-center rounded-lg text-[#888890] hover:bg-black/[0.04]"
              aria-label="Reset instructions"
              type="button"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
          <p className="mt-3 rounded-xl bg-[#f7f7f4] px-4 py-3 text-xs leading-5 text-[#5c5c66]">
            {instructions}
          </p>
        </section>
      </div>

      <PlaygroundChatPreview
        agentId={agentId}
        agentName={agentName}
        enabledFeatures={enabledFeatures}
        iconName={iconName}
        suggestedQuestions={suggestedQuestions}
        themeColor={selectedColor}
        welcomeMessage={welcomeMessage}
      />
    </div>
  );
}

function FeatureCheck({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-16 items-start gap-3 rounded-xl border p-3 text-left transition",
        active
          ? "border-[#d8ddff] bg-[#f7f8ff]"
          : "border-black/[0.08] bg-white text-[#777780] hover:bg-black/[0.03]"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
          active ? "border-[#6256ff] bg-[#6256ff] text-white" : "border-[#cfcfd6] bg-white"
        )}
      >
        {active ? <Check size={14} strokeWidth={3} /> : <EyeOff size={13} className="text-[#9a9aa3]" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#18181b]">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-[#777780]">{description}</span>
      </span>
    </button>
  );
}
