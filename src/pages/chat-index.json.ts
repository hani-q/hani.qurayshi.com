// The hero chat's search index, built once at build time: every résumé passage with its
// all-MiniLM-L6-v2 embedding, quantized to int8 and base64-packed. The browser then only
// embeds the visitor's question, with the same model (src/scripts/chat/embed.worker.ts).
import type { APIRoute } from "astro";
import { pipeline } from "@huggingface/transformers";
import { buildKnowledge, EMBED_MODEL } from "../data/chat-knowledge";
import { products, openSource } from "../data/projects";

export const GET: APIRoute = async () => {
  const { passages } = buildKnowledge([...products, ...openSource]);
  const extract = await pipeline("feature-extraction", EMBED_MODEL, { dtype: "q8" });
  const vectors = (await extract(passages.map((p) => p.text), { pooling: "mean", normalize: true })).tolist() as number[][];
  const packed = Int8Array.from(vectors.flat(), (v) => Math.max(-127, Math.min(127, Math.round(v * 127))));
  return new Response(
    JSON.stringify({ passages, dims: vectors[0].length, vectors: Buffer.from(packed.buffer).toString("base64") }),
    { headers: { "Content-Type": "application/json" } },
  );
};
