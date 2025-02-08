import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message }: { message: string } = await req.json();
  // // TODO: Filter to only include last message when using langgraph
  // const allMessages: Messages = messages.map((message) =>
  //   message.role === "user" ? new HumanMessage(message.content) : new AIMessage(message.content)
  // );
  // // Stream of messages
  // const result = await app.invoke({ messages: allMessages });
  // const lastMessage = result.messages[result.messages.length - 1];
  return NextResponse.json({ message });
}
