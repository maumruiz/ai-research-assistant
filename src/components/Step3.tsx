"use client";

import { Loader2 } from "lucide-react";

import { useAppStore } from "@/hooks/useStore";

import Expert from "./Expert";

export default function Step3() {
  const isThinking = useAppStore((state) => state.isThinking);
  const experts = useAppStore((state) => state.analysts);

  return (
    <div className="py-8 text-center">
      {isThinking ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="size-8 animate-spin" />
          <p>Thinking...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Thinking Complete!</h2>
          <p>Your report is ready.</p>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-4">
        {experts.map((expert) => (
          <Expert key={expert.name} expert={expert} />
        ))}
      </div>
    </div>
  );
}
