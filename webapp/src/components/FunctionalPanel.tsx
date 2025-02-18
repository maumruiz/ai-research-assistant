"use client";
import { useEffect } from "react";

import { useAppStore } from "@/hooks/useStore";

import ProgressIndicator from "./ProgressIndicator";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

function FunctionalPanel() {
  const step = useAppStore((state) => state.step);
  const showSecondPanel = useAppStore((state) => state.haveResponse);
  const createThread = useAppStore((state) => state.createThread);

  useEffect(() => {
    createThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
        showSecondPanel ? "right-1/2" : "right-0"
      }`}
    >
      <div className="container relative mx-auto size-full max-w-3xl ">
        <div className="absolute left-0 top-0 w-full p-8 pt-20">
          <ProgressIndicator currentStep={step} totalSteps={3} />
        </div>
        <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 bg-background p-8">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
        </div>
      </div>
    </div>
  );
}

export default FunctionalPanel;
