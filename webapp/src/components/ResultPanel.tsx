"use client";
import { useAppStore } from "@/hooks/useStore";

function ResultPanel() {
  const report = useAppStore((state) => state.report);
  const showSecondPanel = useAppStore((state) => state.haveResponse);

  return (
    <div
      className={`absolute right-0 top-0 h-full w-1/2 overflow-y-auto bg-muted p-8 transition-transform duration-500 ease-in-out ${
        showSecondPanel ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* <ReactMarkdown>{markdownContent}</ReactMarkdown> */}
      {report}
    </div>
  );
}

export default ResultPanel;
