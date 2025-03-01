/* eslint-disable @next/next/no-img-element */
import { InfoIcon, MessageCircleWarningIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Analyst } from "@/hooks/useStore";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function Expert({ expert }: { expert: Analyst }) {
  if (!expert) {
    return null;
  }

  return (
    <Card key={expert.name}>
      <CardContent className="flex items-center p-4 pt-10">
        {expert.interview === "" && (
          <div className="flex grow items-center justify-center gap-16">
            <div
              className={"size-8 scale-125 bg-[-32px_-64px] bg-no-repeat"}
              style={{
                backgroundImage: `url('/avatars/${expert.avatar || 1}.png')`,
              }}
            >
              {expert.turn === "answering" && (
                <>
                  <img
                    src="/chat-bubble.svg"
                    className={"relative -top-7 left-4 size-8 -scale-x-100"}
                    alt="chat-bubble"
                  ></img>
                  <div className="animate-thinking absolute -top-7 left-4 size-8 scale-125">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </div>
                </>
              )}
            </div>
            <div
              className={"size-8 scale-125 bg-[-32px_-32px] bg-no-repeat"}
              style={{
                backgroundImage: `url('/avatars/${25}.png')`,
              }}
            >
              {expert.turn === "asking" && (
                <>
                  <img
                    src="/chat-bubble.svg"
                    className={"relative -left-4 -top-7 size-8"}
                    alt="chat-bubble"
                  ></img>
                  <div className="animate-thinking absolute -left-4 -top-7 size-8 scale-125">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {expert.interview !== "" && (
          <div className="flex grow items-center justify-center gap-4">
            <div
              className={"size-8 scale-125 bg-[-32px_0px] bg-no-repeat"}
              style={{
                backgroundImage: `url('/avatars/${expert.avatar || 1}.png')`,
              }}
            ></div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <MessageCircleWarningIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="h-5/6 w-2/4 max-w-3xl overflow-auto">
                <DialogHeader>
                  <DialogTitle>Interview with {expert.name}</DialogTitle>
                  <DialogDescription>
                    <ReactMarkdown className="prose">{expert.interview}</ReactMarkdown>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex items-center gap-2">
          <HoverCard>
            <HoverCardTrigger>
              <InfoIcon className="cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-1">
                <h3 className="font-semibold">{expert.name}</h3>
                <p className="text-sm text-muted-foreground">{expert.role}</p>
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
