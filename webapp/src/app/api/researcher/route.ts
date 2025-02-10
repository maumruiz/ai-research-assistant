import { Client } from "@langchain/langgraph-sdk";

import logger from "@/lib/logger";

const client = new Client();

export async function POST(req: Request) {
  const { message }: { message: string } = await req.json();
  logger.info(`Message: ${message}`);

  const thread = await client.threads.create();
  const streamResponse = client.runs.stream(thread.thread_id, "researcher", {
    input: { topic: "The best comfy and simulation games of 2024 in steam", max_analysts: 3 },
    streamMode: "events",
    config: { configurable: { user_id: "test3" } },
  });

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of streamResponse) {
        // You can format the chunk as needed. Here, we're converting to JSON text.
        controller.enqueue(new TextEncoder().encode(JSON.stringify(chunk)));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "application/json" },
  });
}
