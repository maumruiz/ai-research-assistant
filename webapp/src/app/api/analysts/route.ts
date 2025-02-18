import { streamThread } from "@/lib/langchain";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  const { message, nAnalysts, threadId }: { message: string; nAnalysts: number; threadId: string } =
    await req.json();
  logger.info(`Message: ${message} | nAnalysts: ${nAnalysts} | threadId: ${threadId}`);

  const readable = streamThread(threadId, { topic: message, max_analysts: nAnalysts });

  return new Response(readable, {
    headers: { "Content-Type": "application/json" },
  });
}
