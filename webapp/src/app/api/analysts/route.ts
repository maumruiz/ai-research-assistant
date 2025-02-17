import { Client } from "@langchain/langgraph-sdk";

import logger from "@/lib/logger";

const client = new Client();

export async function POST(req: Request) {
  const { message, nAnalysts }: { message: string; nAnalysts: number } = await req.json();
  logger.info(`Message: ${message} | nAnalysts: ${nAnalysts}`);

  const thread = await client.threads.create();
  const streamResponse = client.runs.stream(thread.thread_id, "researcher", {
    input: { topic: message, max_analysts: nAnalysts },
    streamMode: "events",
    config: { configurable: { user_id: "test4" } },
  });

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of streamResponse) {
        if (chunk.event === "metadata" || !chunk.data) continue;
        const filtered = {
          event: chunk.data.event,
          name: chunk.data.name,
          data: chunk.data.data,
        };
        controller.enqueue(new TextEncoder().encode(JSON.stringify(filtered)));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "application/json" },
  });
}
