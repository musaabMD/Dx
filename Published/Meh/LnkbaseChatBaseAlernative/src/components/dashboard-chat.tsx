import { AssistantThreadPanel } from "@/app/assistant";

export function DashboardChat() {
  return (
    <div className="h-[calc(100vh-3.5rem)] min-h-0 w-full bg-background">
      <AssistantThreadPanel />
    </div>
  );
}
