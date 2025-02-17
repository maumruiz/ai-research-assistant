import { create } from "zustand";

import { streamAsyncIterator } from "@/lib/utils";

interface Analyst {
  name: string;
  description: string;
  role: string;
  affiliation: string;
}

interface Store {
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
  askForAnalysts: (values: { message: string; nAnalysts: number }) => Promise<void>;
}

export const useAppStore = create<Store>()((set) => ({
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
  askForAnalysts: async (values) => {
    set({ isThinking: true });
    const stream = await fetch("/api/researcher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: values.message }),
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
}));
