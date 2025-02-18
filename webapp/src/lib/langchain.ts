import { Client } from "@langchain/langgraph-sdk";

const client = new Client();

const config = {
  configurable: {
    user_id: "test-user",
  },
};

export async function createThread() {
  const thread = await client.threads.create();
  return thread;
}

export async function updateState(
  threadId: string,
  values: Record<string, unknown>,
  asNode: string
) {
  await client.threads.updateState(threadId, { values, asNode });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function streamThread(threadId: string, input: any = null) {
  const streamResponse = client.runs.stream(threadId, "researcher", {
    input,
    streamMode: "events",
    config,
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
        // logger.info(`Event: ${filtered.event} | Name: ${filtered.name} | Data: ${JSON.stringify(filtered.data)}`);
        const payload = JSON.stringify(filtered) + "\n";
        controller.enqueue(new TextEncoder().encode(payload));
      }
      controller.close();
    },
  });

  return readable;
}
