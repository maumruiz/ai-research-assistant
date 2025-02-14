import { create } from "zustand";

interface Store {
  haveResponse: boolean;
  report: string;
  analysts: string[];
  setHaveResponse: (haveResponse: boolean) => void;
  setReport: (report: string) => void;
  setAnalysts: (analysts: string[]) => void;
}

export const useAppStore = create<Store>()((set) => ({
  haveResponse: false,
  report: "",
  analysts: [],
  setHaveResponse: (haveResponse) => set({ haveResponse }),
  setReport: (report) => set({ report }),
  setAnalysts: (analysts) => set({ analysts }),
}));
