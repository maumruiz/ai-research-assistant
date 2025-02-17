import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function streamAsyncIterator(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder("utf-8");
  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) return;
          const text = decoder.decode(value);
          // console.log(text);
          try {
            yield JSON.parse(text);
          } catch (err) {
            console.error(`Error parsing JSON: ${err} from streamed text ${text}`);
            toast.error("Error parsing JSON from stream");
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}
