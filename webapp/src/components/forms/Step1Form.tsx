"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { streamAsyncIterator } from "@/lib/utils";

const formSchema = z.object({
  message: z.string().min(2).max(50),
  nAnalysts: z.coerce.number().int().min(1).max(10),
});

export default function Step1Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setStep = useAppStore((state) => state.setStep);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      nAnalysts: 3,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStep(2);
    return;
    setIsSubmitting(true);
    const stream = await fetch("http://localhost:3000/api/researcher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: values.message }),
    });

    if (stream.body) {
      const reader = stream.body.getReader();
      for await (const chunk of streamAsyncIterator(reader)) {
        console.log(chunk);
      }
    }

    toast(
      <div className="flex flex-col space-y-2">
        <pre className="mt-2 w-[320px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
        <pre className="mt-2 w-[320px] rounded-md bg-gray-200 p-4">
          <code className="text-black">{"data.message"}</code>
        </pre>
      </div>
    );
    form.reset(); // This will clear the input
    setIsSubmitting(false);
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
                <Input placeholder="Enter a topic..." {...field} disabled={isSubmitting} />
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
                  disabled={isSubmitting}
                />
              </FormControl>
              {/* <FormDescription>This is your public display name.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
