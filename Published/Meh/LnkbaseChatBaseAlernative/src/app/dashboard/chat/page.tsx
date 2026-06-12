import { DashboardChat } from "@/components/dashboard-chat";
import { DashboardShell } from "@/components/dashboard-shell";

export default function DashboardChatPage() {
  return (
    <DashboardShell title="Chat" flushContent>
      <DashboardChat />
    </DashboardShell>
  );
}
