// Semantic search over the résumé passages with all-MiniLM-L6-v2 (int8, ~23 MB).
// init: download the model and load the passage vectors precomputed at build time
// (/chat-index.json). query: cosine scores for a question.
import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import { EMBED_MODEL } from "../../data/chat-knowledge";

env.allowLocalModels = false;
// CPU-only runtime (3 MB brotli) instead of the default WebGPU-capable build (5.5 MB); this tiny model runs on wasm.
const ort = env.backends.onnx as any;
const cdn = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ort.versions.web}/dist/ort-wasm-simd-threaded`;
ort.wasm.wasmPaths = { mjs: `${cdn}.mjs`, wasm: `${cdn}.wasm` };

let extract: FeatureExtractionPipeline | null = null;
let vectors: Int8Array = new Int8Array();
let dims = 0;

self.onmessage = async ({ data }: MessageEvent) => {
  try {
    if (data.type === "init") {
      dims = data.dims;
      vectors = new Int8Array(Uint8Array.from(atob(data.vectors), (c) => c.charCodeAt(0)).buffer);
      extract = await pipeline("feature-extraction", EMBED_MODEL, {
        dtype: "q8",
        device: "wasm",
        progress_callback: (p: any) => {
          if (p.status === "progress" && p.file?.endsWith(".onnx")) postMessage({ type: "progress", loaded: p.loaded, total: p.total });
        },
      });
      postMessage({ type: "ready" });
    } else if (data.type === "query") {
      const q = (await extract!(data.text, { pooling: "mean", normalize: true })).data as Float32Array;
      const scores: number[] = [];
      for (let o = 0; o < vectors.length; o += dims) {
        let s = 0;
        for (let i = 0; i < dims; i++) s += vectors[o + i] * q[i];
        scores.push(s / 127);
      }
      postMessage({ type: "result", id: data.id, scores });
    }
  } catch (e) {
    postMessage({ type: "error", id: data.id, message: String((e as Error)?.message ?? e) });
  }
};
