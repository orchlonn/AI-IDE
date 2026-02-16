import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { project_id, question } = await req.json();
    if (!project_id || !question) {
      return new Response(
        JSON.stringify({ error: "Missing project_id or question" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = getSupabase();
    const openai = getOpenAI();

    // Embed the question
    const embRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const queryEmbedding = embRes.data[0].embedding;

    // Retrieve relevant chunks via pgvector similarity search
    const { data: matches, error: matchErr } = await supabase.rpc(
      "match_code_chunks",
      {
        query_embedding: queryEmbedding,
        match_project_id: project_id,
        match_threshold: 0.3,
        match_count: 8,
      },
    );

    if (matchErr) {
      return new Response(
        JSON.stringify({ error: `Search failed: ${matchErr.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Build context from matched chunks
    const context = (matches ?? [])
      .map(
        (m: { file_path: string; content: string; similarity: number }) =>
          m.content,
      )
      .join("\n\n---\n\n");

    // Stream response from OpenAI
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a helpful coding assistant. Answer the user's question based on the code context provided below. If the context doesn't contain relevant information, say so honestly.

## Code Context
${context}`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    // Convert OpenAI stream to ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
