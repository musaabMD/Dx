"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Tasks
        </h1>
        <div className="space-y-4">
          {tasks?.map(({ _id, text, isCompleted }) => (
            <div key={_id} className="flex items-center gap-4 p-4 border rounded-lg">
              <span className={isCompleted ? "line-through text-gray-500" : ""}>
                {text}
              </span>
              {isCompleted && (
                <span className="text-green-500">✓</span>
              )}
            </div>
          ))}
          {tasks === undefined && (
            <p className="text-center text-gray-500">Loading tasks...</p>
          )}
        </div>
      </div>
    </main>
  );
}
