import { create } from "zustand";

import { streamAsyncIterator } from "@/lib/utils";

interface Analyst {
  name: string;
  description: string;
  role: string;
  affiliation: string;
}

interface Store {
  threadId: string;
  haveResponse: boolean;
  report: string;
  analysts: Analyst[];
  nAnalysts: number;
  step: number;
  isThinking: boolean;
  setHaveResponse: (haveResponse: boolean) => void;
  setReport: (report: string) => void;
  setAnalysts: (analysts: Analyst[]) => void;
  setNAnalysts: (nAnalysts: number) => void;
  setStep: (step: number) => void;
  createThread: () => Promise<void>;
  askForAnalysts: (values: { message: string; nAnalysts: number }) => Promise<void>;
  giveFeedback: (values: { feedback: string }) => Promise<void>;
  generateReport: () => Promise<void>;
}

export const useAppStore = create<Store>()((set, get) => ({
  threadId: "",
  haveResponse: false,
  report: "",
  analysts: [],
  nAnalysts: 0,
  step: 1,
  isThinking: false,
  setHaveResponse: (haveResponse) => set({ haveResponse }),
  setReport: (report) => set({ report }),
  setAnalysts: (analysts) => set({ analysts }),
  setNAnalysts: (nAnalysts) => set({ nAnalysts }),
  setStep: (step) => set({ step }),
  createThread: async () => {
    const response = await fetch("/api/thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      set({ threadId: data.threadId });
    }
  },
  askForAnalysts: async (values) => {
    set({ isThinking: true });
    const stream = await fetch("/api/analysts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: values.message,
        nAnalysts: values.nAnalysts,
        threadId: get().threadId,
      }),
    });
    if (stream.body) {
      const reader = stream.body.getReader();
      for await (const chunk of streamAsyncIterator(reader)) {
        if (chunk.event === "on_chain_end" && chunk.name === "create_analysts") {
          set({ analysts: chunk.data.output.analysts });
        }
      }
    }
    set({ isThinking: false });
  },
  giveFeedback: async (values) => {
    set({ isThinking: true });
    const stream = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: values.feedback, threadId: get().threadId }),
    });
    if (stream.body) {
      const reader = stream.body.getReader();
      for await (const chunk of streamAsyncIterator(reader)) {
        if (chunk.event === "on_chain_end" && chunk.name === "create_analysts") {
          set({ analysts: chunk.data.output.analysts });
        }
      }
    }
    set({ isThinking: false });
  },
  generateReport: async () => {
    set({ isThinking: true });
    const stream = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: get().threadId }),
    });
    if (stream.body) {
      const reader = stream.body.getReader();
      for await (const chunk of streamAsyncIterator(reader)) {
        if (chunk.event === "on_chain_end" && chunk.name === "finalize_report") {
          set({ report: chunk.data.output.final_report, haveResponse: true });
        }
        console.log(chunk);
      }
    }
    set({ isThinking: false });
  },
}));
