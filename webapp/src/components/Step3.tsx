"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Step3() {
  const [isThinking, setIsThinking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsThinking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
          <p>Your onboarding process is finished.</p>
        </div>
      )}
    </div>
  );
}
