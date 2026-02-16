import { spawn } from "child_process";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { command, cwd } = await req.json();

  if (!command || typeof command !== "string") {
    return new Response(JSON.stringify({ error: "command is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const workingDir = cwd || process.env.HOME || "/";

  const stream = new ReadableStream({
    start(controller) {
      const child = spawn(command, {
        shell: true,
        cwd: workingDir,
        env: { ...process.env, TERM: "dumb", FORCE_COLOR: "0" },
      });

      const encoder = new TextEncoder();

      child.stdout.on("data", (data: Buffer) => {
        controller.enqueue(encoder.encode(data.toString()));
      });

      child.stderr.on("data", (data: Buffer) => {
        controller.enqueue(encoder.encode(data.toString()));
      });

      child.on("close", (code) => {
        controller.enqueue(
          encoder.encode(`\n__EXIT_CODE__:${code ?? 0}\n`)
        );
        controller.close();
      });

      child.on("error", (err) => {
        controller.enqueue(encoder.encode(`Error: ${err.message}\n`));
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
