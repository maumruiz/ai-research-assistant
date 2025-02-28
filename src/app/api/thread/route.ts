import { NextResponse } from "next/server";

import { createThread } from "@/lib/langchain";
import logger from "@/lib/logger";

export async function POST() {
  const thread = await createThread();

  logger.info(`Thread created: ${JSON.stringify(thread.thread_id)}`);

  return NextResponse.json({ threadId: thread.thread_id });
}
