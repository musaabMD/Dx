"use client";

import { Archive, Copy, Edit3, MoreVertical, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AgentRowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl border border-black/[0.08] bg-white text-[#4c4c55] shadow-sm hover:bg-[#f7f7f5]"
          />
        }
      >
        <MoreVertical size={17} />
        <span className="sr-only">Open agent actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
        <DropdownMenuItem className="gap-3 px-2 py-2 text-[15px]">
          <Edit3 size={17} />
          Edit
          <DropdownMenuShortcut>E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-2 py-2 text-[15px]">
          <QrCode size={17} />
          Embed code
          <DropdownMenuShortcut>Q</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-2 py-2 text-[15px]">
          <Copy size={17} />
          Copy agent ID
          <DropdownMenuShortcut>I</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-3 px-2 py-2 text-[15px]">
          <Archive size={17} />
          Archive
          <DropdownMenuShortcut>A</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" className="gap-3 px-2 py-2 text-[15px]">
          <Trash2 size={17} />
          Delete
          <DropdownMenuShortcut className="rounded-md bg-red-50 px-1.5 py-0.5 text-red-600">
            X
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
