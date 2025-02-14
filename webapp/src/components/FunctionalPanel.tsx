"use client";
import { useAppStore } from "@/hooks/useStore";

import SimpleInput from "./SimpleInput";

function FunctionalPanel() {
  const showSecondPanel = useAppStore((state) => state.haveResponse);

  return (
    <div
      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
        showSecondPanel ? "right-1/2" : "right-0"
      }`}
    >
      <div className="relative flex size-full items-center justify-center">
        <SimpleInput />
      </div>
    </div>
  );
}

export default FunctionalPanel;
