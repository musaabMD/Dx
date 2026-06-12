"use client";

import {
  AssistantRuntimeProvider,
  Suggestions,
  useAui,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { usePathname } from "next/navigation";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";
import { Thread } from "@/components/assistant-ui/thread";
import type { ReactNode } from "react";

const suggestions = [
  "How can Lnkbase help me?",
  "Which plan is right for me?",
  "How do I embed the widget?",
  "Can Lnkbase collect leads?",
];

export function Assistant() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/widget") ||
    pathname === "/dashboard" ||
    pathname === "/dashboard/chat"
  ) {
    return null;
  }

  return (
    <LnkbaseAssistantRuntime>
      <AssistantModal />
    </LnkbaseAssistantRuntime>
  );
}

export function AssistantThreadPanel() {
  return (
    <LnkbaseAssistantRuntime>
      <Thread />
    </LnkbaseAssistantRuntime>
  );
}

function LnkbaseAssistantRuntime({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });
  const aui = useAui({
    suggestions: Suggestions(suggestions),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      {children}
    </AssistantRuntimeProvider>
  );
}
