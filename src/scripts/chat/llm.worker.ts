// Runs WebLLM (Qwen3 0.6B on WebGPU) off the main thread; the page talks to it through
// CreateWebWorkerMLCEngine.
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => handler.onmessage(msg);
