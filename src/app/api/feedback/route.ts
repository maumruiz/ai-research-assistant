import { streamThread, updateState } from "@/lib/langchain";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  const { feedback, threadId }: { feedback: string; threadId: string } = await req.json();
  logger.info(`Feedback: ${feedback} for thread: ${threadId}`);

  await updateState(threadId, { human_analyst_feedback: feedback }, "human_feedback");
  const readable = streamThread(threadId);

  return new Response(readable, {
    headers: { "Content-Type": "application/json" },
  });
}
