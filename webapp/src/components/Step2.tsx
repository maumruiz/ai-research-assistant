import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/hooks/useStore";

import Step2Form from "./forms/Step2Form";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function Step2() {
  const experts = useAppStore((state) => state.analysts);
  const nExperts = useAppStore((state) => state.nAnalysts);
  const isThinking = useAppStore((state) => state.isThinking);
  const setStep = useAppStore((state) => state.setStep);

  console.log(nExperts);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {!isThinking &&
          experts.map((expert) => (
            <Card key={expert.name}>
              <CardContent className="flex items-center space-x-4 p-4">
                <Avatar>
                  <AvatarFallback>{expert.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{expert.name}</h3>
                  <p className="text-sm text-muted-foreground">{expert.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        {isThinking &&
          Array(nExperts)
            .fill(null)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center space-x-4 p-4">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      <div>
        <Step2Form />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={() => setStep(3)}>Next</Button>
      </div>
    </div>
  );
}
