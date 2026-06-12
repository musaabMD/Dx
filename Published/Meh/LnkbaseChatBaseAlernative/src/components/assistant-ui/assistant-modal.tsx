"use client";

import { BotIcon, ChevronDownIcon } from "lucide-react";

import { type FC } from "react";
import { AssistantModalPrimitive } from "@assistant-ui/react";

import { Thread } from "@/components/assistant-ui/thread";

export const AssistantModal: FC = () => {
  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[999999] size-14 max-sm:right-5 max-sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <AssistantModalPrimitive.Trigger
          className="aui-modal-button group relative grid size-full place-items-center rounded-full bg-[#6b5cff] text-white shadow-2xl shadow-[#6b5cff]/30 transition-transform hover:scale-105 active:scale-95"
          title="Open Assistant"
          aria-label="Open Assistant"
        >
          <BotIcon className="aui-modal-button-closed-icon absolute size-6 transition-all group-data-[state=closed]:scale-100 group-data-[state=closed]:rotate-0 group-data-[state=open]:scale-0 group-data-[state=open]:rotate-90" />
          <ChevronDownIcon className="aui-modal-button-open-icon absolute size-6 transition-all group-data-[state=closed]:scale-0 group-data-[state=closed]:-rotate-90 group-data-[state=open]:scale-100 group-data-[state=open]:rotate-0" />
          <span className="aui-sr-only sr-only">Open Assistant</span>
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in z-[999999] h-[min(680px,calc(100dvh-112px))] w-[min(420px,calc(100vw-32px))] overflow-clip overscroll-contain rounded-2xl border p-0 shadow-2xl outline-none max-sm:bottom-0 max-sm:h-dvh max-sm:w-screen max-sm:rounded-none [&>.aui-thread-root]:bg-inherit [&>.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit"
      >
        <Thread />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};
