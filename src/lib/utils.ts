import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function streamAsyncIterator(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) return;
          // Decode the new chunk and add it to our buffer.
          const chunkText = decoder.decode(value);
          buffer += chunkText;

          // Split on newlines to get ND-JSON lines
          const lines = buffer.split("\n");

          // Keep the last partial line in buffer,
          // pop it out from lines array
          buffer = lines.pop() || "";

          // console.log(text);
          // Now parse each complete line
          for (const line of lines) {
            if (!line.trim()) continue; // skip empty lines
            try {
              yield JSON.parse(line);
            } catch (err) {
              console.error("Error parsing JSON line:", err, line);
              toast.error("Error parsing JSON from stream");
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}
