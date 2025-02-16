interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="relative flex items-center justify-between">
      {/* Connector lines rendered first to appear behind circles */}
      <div className="absolute inset-x-0 top-5 flex justify-between">
        <div className="mx-10 w-full">
          <div className="h-[2px] w-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Circles and labels */}
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center">
          <div
            className={`
                flex size-10 items-center justify-center rounded-full transition-colors
                duration-200
                ${
                  i + 1 <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-muted bg-background text-muted-foreground"
                }
              `}
          >
            {i + 1}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{`Step ${i + 1}`}</div>
        </div>
      ))}
    </div>
  );
}
