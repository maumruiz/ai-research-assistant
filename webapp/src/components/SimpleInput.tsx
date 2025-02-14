"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/hooks/useStore";

export default function SimpleInput() {
  const [inputValue, setInputValue] = useState("");
  const setHaveResponse = useAppStore((state) => state.setHaveResponse);
  const setReport = useAppStore((state) => state.setReport);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const dummyMarkdown = `
# Welcome, ${inputValue}!
This is a sample markdown content. Your input was: **${inputValue}**
## Features:
- Dynamic rendering
- Smooth transitions
- Markdown support

> This is just a placeholder. In a real application, you might fetch personalized content based on the user's input.
      `;

      setReport(dummyMarkdown);
      setHaveResponse(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md px-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter something..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="grow"
        />
        <Button type="submit">Send</Button>
      </div>
    </form>
  );
}
