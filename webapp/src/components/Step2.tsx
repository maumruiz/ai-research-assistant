import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/hooks/useStore";

import Step2Form from "./forms/Step2Form";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const experts = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Expert ${i + 1}`,
  description: `An expert in something`,
}));

export default function Step2() {
  const setStep = useAppStore((state) => state.setStep);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {experts.map((expert) => (
          <Card key={expert.id}>
            <CardContent className="flex items-center space-x-4 p-4">
              <Avatar>
                <AvatarFallback>{expert.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{expert.name}</h3>
                <p className="text-sm text-muted-foreground">{expert.description}</p>
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
