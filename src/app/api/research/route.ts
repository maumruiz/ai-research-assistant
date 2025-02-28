import { streamThread, updateState } from "@/lib/langchain";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  const { threadId }: { feedback: string; threadId: string } = await req.json();
  logger.info(`Generating report of thread: ${threadId}`);

  await updateState(threadId, { human_analyst_feedback: null }, "human_feedback");
  const readable = streamThread(threadId);

  return new Response(readable, {
    headers: { "Content-Type": "application/json" },
  });
}
