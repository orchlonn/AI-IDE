import { spawn } from "child_process";
import { writeFileSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { command, cwd, file } = await req.json();

  if (!command || typeof command !== "string") {
    return new Response(JSON.stringify({ error: "command is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If file content is provided, write it to a temp directory before running
  let tempDir: string | null = null;
  let actualCommand = command;

  if (file?.name && file?.content != null) {
    tempDir = join(tmpdir(), "ai-ide-run-" + Date.now());
    mkdirSync(tempDir, { recursive: true });
    const filePath = join(tempDir, file.name);
    writeFileSync(filePath, file.content, "utf-8");
    // Replace the filename in the command with the full temp path
    actualCommand = command.replace(`"${file.name}"`, `"${filePath}"`);
  }

  const workingDir = tempDir || cwd || process.env.HOME || "/";

  const stream = new ReadableStream({
    start(controller) {
      const child = spawn(actualCommand, {
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
        // Clean up temp file
        if (tempDir && file?.name) {
          try { unlinkSync(join(tempDir, file.name)); } catch {}
        }
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
