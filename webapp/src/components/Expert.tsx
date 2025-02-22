import { InfoIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Analyst } from "@/hooks/useStore";

import { Card, CardContent } from "./ui/card";

export default function Expert({ expert }: { expert: Analyst }) {
  if (!expert) {
    return null;
  }

  return (
    <Card key={expert.name}>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar>
          <AvatarFallback>{expert.name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <h3 className="font-semibold">{expert.name}</h3>
          {/* <p className="text-sm text-muted-foreground">ID: {expert.id}</p> */}
          <p className="text-sm text-muted-foreground">{expert.role}</p>
          {/* <p className="text-sm text-muted-foreground">
            Interview: {JSON.stringify(expert.interview, null, 2)}
          </p> */}
        </div>
        <div className="ml-auto cursor-pointer">
          <HoverCard>
            <HoverCardTrigger>
              <InfoIcon />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Affiliation: {expert.affiliation}</h4>
                <p className="text-sm">{expert.description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardContent>
    </Card>
  );
}
