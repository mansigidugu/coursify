import { runPipeline } from "@/lib/orchestrator";

export const maxDuration = 300;

export async function POST(request: Request) {
  const { topic } = await request.json();

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return new Response(JSON.stringify({ error: "topic is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runPipeline(topic.trim())) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", text: message }) + "\n")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
