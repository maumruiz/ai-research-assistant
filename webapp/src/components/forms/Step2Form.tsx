"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/hooks/useStore";
// import { useAppStore } from "@/hooks/useStore";

const formSchema = z.object({
  feedback: z.string().min(2).max(400),
});

export default function Step2Form() {
  const isThinking = useAppStore((state) => state.isThinking);
  const giveFeedback = useAppStore((state) => state.giveFeedback);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    giveFeedback({ feedback: values.feedback });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full gap-4">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem className="grow">
              {/* <FormLabel>Message</FormLabel> */}
              <FormControl>
                <Input
                  placeholder="Give feedback about the experts"
                  {...field}
                  disabled={isThinking}
                />
              </FormControl>
              {/* <FormDescription>This is your public display name.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isThinking}>
          <SendHorizonal className="size-4" />
        </Button>
      </form>
    </Form>
  );
}
