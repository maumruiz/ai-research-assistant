"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/hooks/useStore";

const formSchema = z.object({
  message: z.string().min(2),
  nAnalysts: z.coerce.number().int().min(1).max(10),
});

export default function Step1Form() {
  const isThinking = useAppStore((state) => state.isThinking);
  const setStep = useAppStore((state) => state.setStep);
  const askForAnalysts = useAppStore((state) => state.askForAnalysts);
  const setNanalysts = useAppStore((state) => state.setNAnalysts);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      nAnalysts: 3,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    askForAnalysts(values);
    setNanalysts(values.nAnalysts);
    setStep(2);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="grow">
              <FormLabel>Research Topic</FormLabel>
              <FormControl>
                <Input placeholder="Enter a topic..." {...field} disabled={isThinking} />
              </FormControl>
              {/* <FormDescription>This is your public display name.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nAnalysts"
          render={({ field }) => (
            <FormItem className="grow">
              <FormLabel>Number of experts to create</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Number of experts"
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
          Submit
        </Button>
      </form>
    </Form>
  );
}
