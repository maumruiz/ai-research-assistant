"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  message: z.string().min(2).max(50),
});

export default function SimpleInput() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const response = await fetch("http://localhost:3000/api/researcher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: values.message }),
    });
    const data = await response.json();

    toast(
      <div className="flex flex-col space-y-2">
        <pre className="mt-2 w-[320px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
        <pre className="mt-2 w-[320px] rounded-md bg-gray-200 p-4">
          <code className="text-black">{data.message}</code>
        </pre>
      </div>
    );
    form.reset(); // This will clear the input
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-sm items-center space-x-2"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="grow">
              {/* <FormLabel>Message</FormLabel> */}
              <FormControl>
                <Input placeholder="message..." {...field} disabled={isSubmitting} />
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
