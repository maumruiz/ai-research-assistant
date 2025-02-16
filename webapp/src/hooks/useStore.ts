import { create } from "zustand";

interface Store {
  haveResponse: boolean;
  report: string;
  analysts: string[];
  step: number;
  setHaveResponse: (haveResponse: boolean) => void;
  setReport: (report: string) => void;
  setAnalysts: (analysts: string[]) => void;
  setStep: (step: number) => void;
  askForAnalysts: () => Promise<void>;
}

export const useAppStore = create<Store>()((set) => ({
  haveResponse: false,
  report: "",
  analysts: [],
  step: 1,
  setHaveResponse: (haveResponse) => set({ haveResponse }),
  setReport: (report) => set({ report }),
  setAnalysts: (analysts) => set({ analysts }),
  setStep: (step) => set({ step }),
  askForAnalysts: async () => {
    // const response = await fetch("http://localhost:3000/api/analysts");
    // const analysts = await response.json();
    // set({ analysts });
  },
}));
