import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAI } from "@/lib/openai";
import { chunkProject } from "@/lib/chunker";

export async function POST(req: NextRequest) {
  try {
    const { project_id } = await req.json();
    if (!project_id) {
      return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
    }

    const supabase = getSupabase();
    const openai = getOpenAI();

    // Load project
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("file_contents")
      .eq("id", project_id)
      .single();

    if (projErr || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    const fileContents: Record<string, string> = project.file_contents ?? {};
    const chunks = chunkProject(fileContents);

    if (chunks.length === 0) {
      return NextResponse.json({ chunksIndexed: 0 });
    }

    // Generate embeddings in batches of 100
    const BATCH = 100;
    const embeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);
      const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch.map((c) => c.content),
      });
      for (const item of res.data) {
        embeddings.push(item.embedding);
      }
    }

    // Delete old chunks for this project
    await supabase.from("code_chunks").delete().eq("project_id", project_id);

    // Insert new chunks
    const rows = chunks.map((chunk, i) => ({
      project_id,
      file_path: chunk.file_path,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      embedding: embeddings[i],
    }));

    const INSERT_BATCH = 50;
    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const batch = rows.slice(i, i + INSERT_BATCH);
      const { error: insertErr } = await supabase
        .from("code_chunks")
        .insert(batch);
      if (insertErr) {
        return NextResponse.json(
          { error: `Insert failed: ${insertErr.message}` },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ chunksIndexed: chunks.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
