import { create } from "zustand";

import { streamAsyncIterator } from "@/lib/utils";

interface InterviewMessage {
  role: "interviewer" | "expert";
  message: string;
}
export interface Analyst {
  id: string;
  name: string;
  description: string;
  role: string;
  affiliation: string;
  interview: InterviewMessage[];
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
    if (!get().threadId) {
      await get().createThread();
    }

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
        // console.log(chunk);

        if (chunk.event === "on_chain_start" && chunk.name === "conduct_interview") {
          console.log(`Interviewing ${chunk.data.input.analyst.name} on run ${chunk.runId}`);
          const analysts = get().analysts.map((a) =>
            a.name === chunk.data.input.analyst.name ? { ...a, id: chunk.runId } : a
          );
          set({ analysts });
        }

        // // if starting ask_question, add interviewer message
        // if (
        //   chunk.event === "on_chain_start" &&
        //   (chunk.metadata.langgraph_node === "ask_question" ||
        //     chunk.metadata.langgraph_node === "answer_question")
        // ) {
        //   const role: "interviewer" | "expert" =
        //     chunk.metadata.langgraph_node === "ask_question" ? "interviewer" : "expert";
        //   const analystId = chunk.parents[1]; // Run id of the analyst created on "conduct_interview" node
        //   const analysts = get().analysts.map((a) =>
        //     a.id === analystId
        //       ? {
        //           ...a,
        //           interview: [...(a.interview || []), { role, message: "" }],
        //         }
        //       : a
        //   );
        //   set({ analysts });
        // }

        // // On chat model stream and on the "ask_question" node, concatenate the message to the last interviewer message
        // if (
        //   chunk.event === "on_chat_model_stream" &&
        //   (chunk.metadata.langgraph_node === "ask_question" ||
        //     chunk.metadata.langgraph_node === "answer_question")
        // ) {
        //   const analystId = chunk.parents[1]; // Run id of the analyst created on "conduct_interview" node
        //   const analysts = get().analysts.map((a) =>
        //     a.id === analystId
        //       ? {
        //           ...a,
        //           interview: a.interview.map((msg, i) =>
        //             i === a.interview.length - 1
        //               ? { ...msg, message: msg.message + chunk.data.chunk.content }
        //               : msg
        //           ),
        //         }
        //       : a
        //   );
        //   set({ analysts });
        // }

        if (
          chunk.event === "on_chat_model_stream" &&
          chunk.metadata.langgraph_node === "write_report"
        ) {
          const updatedReport = get().report + chunk.data.chunk.content;
          set({ report: updatedReport, haveResponse: true });
        }
      }
    }
    set({ isThinking: false });
  },
}));
