// The hero prompt. The headline and the question line type themselves in; the visitor can
// ask about Hani or scroll on. The first question turns the hero into a chat. Engines, all
// on the visitor's device and loaded only when first needed:
//   search  - default: all-MiniLM-L6-v2 (~23 MB) finds the closest résumé passages and shows them verbatim.
//   smart   - "Smarter answers" toggle (WebGPU only): Qwen3 0.6B (~350 MB) answers in prose
//             from the passages the search found.
//   gemini  - "Gemini" toggle, shown only where Chrome's built-in Gemini Nano (Prompt API) is available.
// The toggles appear once the visitor starts typing.
import type { ChatKnowledge, Passage } from "../../data/chat-knowledge";

type Hit = { p: Passage; score: number };

const MIN_SCORE = 0.3;
const LM_OPTS = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Blanks the text inside els and returns a function that streams it back the way chat UIs
// render model output: sub-word tokens arrive in small, irregular bursts and each one fades in
// (opacity + a little blur), leaving a short trail of fading tokens behind the newest. When
// the stream ends the token spans fold back into plain text nodes.
const TOKEN_FADE_MS = 450;
function blank(els: Element[]) {
  const nodes: { node: Text; text: string }[] = [];
  for (const el of els) {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) nodes.push({ node: n as Text, text: (n as Text).data });
  }
  for (const n of nodes) n.node.data = "";
  // Word pieces about the size of model tokens: a leading space stays with its word, and
  // long words split into chunks of up to five letters.
  const tokens = (text: string) => (text.match(/\s*\S+|\s+$/g) ?? []).flatMap((w) => {
    const m = w.match(/^(\s*)(.*)$/s)!;
    const pieces = m[2].match(/.{1,5}/gs) ?? [""];
    return pieces.map((p, i) => (i ? p : m[1] + p));
  });
  return async () => {
    const hosts: [HTMLElement, Text, string][] = [];
    for (const { node, text } of nodes) {
      const host = document.createElement("span");
      node.replaceWith(host);
      hosts.push([host, node, text]);
      const toks = tokens(text);
      for (let i = 0; i < toks.length; ) {
        // A burst of one or two tokens, then a pause, like tokens arriving over the wire.
        const burst = 1 + Math.floor(Math.random() * 2);
        for (const t of toks.slice(i, i + burst)) {
          const span = document.createElement("span");
          span.className = "sf-tok";
          span.textContent = t;
          host.append(span);
        }
        i += burst;
        await wait(90 + Math.random() * 110);
      }
    }
    // Let the last tokens finish fading, then fold everything back into plain text.
    await wait(TOKEN_FADE_MS);
    for (const [host, node, text] of hosts) { node.data = text; host.replaceWith(node); }
  };
}

// A pill button that behaves like a checkbox: .checked mirrors aria-pressed and a click
// flips it and fires "change" (disabled buttons get no clicks).
function toggle(btn: HTMLButtonElement) {
  btn.addEventListener("click", () => {
    btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
    btn.dispatchEvent(new Event("change"));
  });
  return Object.defineProperty(btn, "checked", {
    get: () => btn.getAttribute("aria-pressed") === "true",
    set: (v: boolean) => btn.setAttribute("aria-pressed", String(v)),
  }) as HTMLButtonElement & { checked: boolean };
}

// The idle prompt: its own line under the welcome, inside the headline so it takes its size.
// It shows what the visitor types (hint until then) and a return key that asks.
function cursorLine(onEnter: () => void) {
  const line = document.createElement("span");
  line.className = "sf-hero-cursor";
  line.setAttribute("aria-hidden", "true");
  const typed = document.createElement("span");
  typed.className = "sf-hero-typed";
  const caret = document.createElement("span");
  caret.className = "sf-type-caret";
  const hint = document.createElement("span");
  hint.className = "sf-hero-ph";
  hint.textContent = "Type your prompt here";
  const enter = document.createElement("button");
  enter.type = "button";
  enter.tabIndex = -1;
  enter.className = "sf-hero-enter";
  enter.textContent = "↵";
  enter.addEventListener("click", (e) => { e.stopPropagation(); onEnter(); });
  line.append(typed, caret, hint, enter);
  return line;
}

export function initChat(root: HTMLElement) {
  const ask = root.querySelector<HTMLElement>("[data-sf-ask]");
  const data = document.getElementById("sf-chat-data");
  const hero = root.querySelector<HTMLElement>(".sf-hero");
  if (!ask || !data || !hero) return;
  const k: Omit<ChatKnowledge, "passages"> = JSON.parse(data.textContent || "{}");
  let passages: Passage[] = [];
  const $ = <T extends HTMLElement>(s: string) => ask.querySelector<T>(s)!;
  const log = $<HTMLElement>(".sf-ask-log");
  const form = $<HTMLFormElement>(".sf-ask-form");
  const input = $<HTMLInputElement>(".sf-ask-input");
  const typed = $<HTMLElement>(".sf-ask-typed");
  const status = $<HTMLElement>(".sf-sl-state");
  const engineLabel = $<HTMLElement>(".sf-sl-engine");
  const opts = $<HTMLElement>(".sf-ask-opts");
  const smartOpt = $<HTMLButtonElement>('[data-sf-opt="smart"]');
  const geminiOpt = $<HTMLButtonElement>('[data-sf-opt="gemini"]');
  const smartBox = toggle(smartOpt);
  const geminiBox = toggle(geminiOpt);

  // The HQ mark is positioned from the hero placeholder; Simplefolio's docking script watches the
  // hero copy's size itself. Chat state changes also animate padding, which resizes nothing, so
  // for their duration tell it to remeasure each frame ('sf:layout', not a fake window resize).
  const layoutChanged = () => window.dispatchEvent(new Event("sf:layout"));
  let followUntil = 0;
  const follow = () => { layoutChanged(); if (performance.now() < followUntil) requestAnimationFrame(follow); };
  new MutationObserver(() => {
    const idle = performance.now() >= followUntil;
    followUntil = performance.now() + 900;
    if (idle) requestAnimationFrame(follow);
  }).observe(hero, { attributes: true, attributeFilter: ["class"] });

  // ---- Intro: a random welcome prompt streams in like model output; the prompt line (with
  // its own cursor) fades in after it.
  const title = hero.querySelector<HTMLElement>(".sf-hero-title")!;
  const welcomes: string[] = JSON.parse(title.dataset.sfWelcomes || "[]");
  const heroLine = cursorLine(() => form.requestSubmit());
  const heroTyped = heroLine.querySelector(".sf-hero-typed")!;
  const welcome = title.querySelector<HTMLElement>(".sf-welcome")!;
  const nameEl = title.querySelector(".sf-hero-name")!;
  // A line with "{name}" gets the highlighted name in its place; jokes are plain text.
  const setWelcome = (line: string) => {
    const [before, after] = line.split("{name}");
    welcome.replaceChildren(...(after === undefined ? [before] : [before, nameEl, after]));
    const len = line.replace("{name}", nameEl.textContent ?? "").length;
    title.classList.toggle("sf-hero-title--long", len > 80);
    title.classList.toggle("sf-hero-title--longer", len > 115);
  };
  if (welcomes.length) setWelcome(welcomes[Math.floor(Math.random() * welcomes.length)]);
  // Screen readers keep the first welcome; the rotating lines below are decoration.
  title.setAttribute("aria-label", title.textContent!.replace(/\s+/g, " ").trim());
  (async () => {
    if (!root.classList.contains("sf-typing")) { title.append(heroLine); setTimeout(rotate); return; }
    const saved = title.cloneNode(true);
    try {
      const typeWelcome = blank([welcome]);
      root.classList.add("sf-typing-run");
      root.classList.remove("sf-typing");
      await typeWelcome();
      title.append(heroLine);
      rotate();
    } catch {
      title.replaceWith(saved);
    } finally {
      root.classList.remove("sf-typing-run");
    }
  })();

  // ---- Rotation: 5s after each line finishes, while the hero sits idle (no typing, no chat,
  // at the top, tab visible), the headline streams in its next line: a programming joke from
  // JokeAPI (safe-mode, short ones only), then a tidbit, then an RFC 1925 truth, in turn. Jokes load in the
  // background with a timeout and never hold the rotation up; until they arrive (or if the
  // API is unreachable) it shows tidbits.
  const tidbits: string[] = JSON.parse(title.dataset.sfTidbits || "[]");
  const truths: string[] = JSON.parse(title.dataset.sfTruths || "[]");
  const pick = (list: string[], last: number) => { let i = Math.floor(Math.random() * list.length); if (i === last && list.length > 1) i = (i + 1) % list.length; return i; };
  let lastTruth = -1;
  let jokes: string[] = [];
  let jokesLoading: Promise<void> | null = null;
  const loadJokes = () =>
    (jokesLoading ??= fetch("https://v2.jokeapi.dev/joke/Programming?type=single&safe-mode&amount=10", { signal: AbortSignal.timeout(4000) })
      .then((r) => r.json())
      .then((d) => { jokes = (d.jokes ?? []).map((j: { joke: string }) => j.joke.replace(/\s+/g, " ").trim()).filter((j: string) => j.length <= 110); })
      .catch(() => {})
      .finally(() => { jokesLoading = null; }));
  // Idle = nobody typing or chatting, the headline on screen (on phones it sits below the
  // logo's first screen) and the tab visible.
  const onScreen = () => { const r = title.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
  const idle = () => !hero.classList.contains("sf-hero--ask") && !input.value && onScreen() && !document.hidden;
  let turn = 0;
  let lastTidbit = -1;
  async function rotate() {
    if (!tidbits.length) return;
    loadJokes();
    for (;;) {
      await wait(5000);
      if (!idle()) continue;
      turn++;
      if (jokes.length < 2) loadJokes();
      let line: string;
      // joke → tidbit → RFC 1925 truth, round and round (a tidbit stands in for a missing joke).
      const kind = turn % 3;
      if (kind === 1 && jokes.length) line = jokes.shift()!;
      else if (kind === 0 && truths.length) line = truths[(lastTruth = pick(truths, lastTruth))];
      else line = tidbits[(lastTidbit = pick(tidbits, lastTidbit))];
      if (!idle()) continue;
      // Reduced motion: swap the line in place, no fade or streaming.
      if (reduced) { setWelcome(line); continue; }
      welcome.classList.add("sf-welcome--out");
      await wait(350);
      setWelcome(line);
      const typeLine = blank([welcome]);
      welcome.classList.remove("sf-welcome--out");
      await typeLine();
    }
  }

  let busy = false;
  let chatting = false;
  let history: { q: string; a: string }[] = [];

  const setStatus = (text: string) => { status.textContent = text; };
  // Download progress (0..1) on the prompt box's bottom edge and as a ring on the model's
  // button; null clears it.
  const setProgress = (p: number | null, chip?: HTMLElement) => {
    for (const el of [form, chip].filter(Boolean) as HTMLElement[]) {
      if (p == null) { el.removeAttribute("data-dl"); el.style.removeProperty("--sf-dl"); }
      else { el.setAttribute("data-dl", ""); el.style.setProperty("--sf-dl", String(Math.min(1, Math.max(0, p)))); }
    }
  };
  const scroll = () => { log.scrollTop = log.scrollHeight; };

  // ---- Semantic search (worker, lazy)
  let embedWorker: Worker | null = null;
  let searchReady: Promise<void> | null = null;
  // Each question in flight; settled by its result or its error, or all at once if the worker dies.
  const pending = new Map<number, { resolve: (scores: number[]) => void; reject: (e: Error) => void }>();
  let qid = 0;
  const ensureSearch = () =>
    (searchReady ??= fetch("/chat-index.json").then((r) => { if (!r.ok) throw new Error(`index ${r.status}`); return r.json(); }).then((index) => new Promise<void>((resolve, reject) => {
      passages = index.passages;
      embedWorker = new Worker(new URL("./embed.worker.ts", import.meta.url), { type: "module" });
      embedWorker.onmessage = ({ data: m }) => {
        if (m.type === "progress" && m.total) setProgress(m.loaded < m.total ? m.loaded / m.total : null);
        if (m.type === "progress" && m.total) setStatus(m.loaded < m.total ? `Loading search model… ${Math.round((m.loaded / m.total) * 100)}%` : "Reading the résumé…");
        else if (m.type === "ready") { if (/^(Loading search|Reading the)/.test(status.textContent || "")) setStatus(""); resolve(); }
        else if (m.type === "result") { pending.get(m.id)?.resolve(m.scores); pending.delete(m.id); }
        else if (m.type === "error") fail(new Error(m.message), m.id);
      };
      // An error with a query id fails that question; any other (or a worker crash) fails startup,
      // every question in flight, and drops the worker so the next question starts a fresh one.
      const fail = (e: Error, id?: number) => {
        const q = id != null ? pending.get(id) : undefined;
        if (q) { pending.delete(id!); q.reject(e); return; }
        for (const p of pending.values()) p.reject(e);
        pending.clear();
        embedWorker?.terminate();
        embedWorker = null;
        searchReady = null;
        reject(e);
      };
      embedWorker.onerror = (ev) => { ev.preventDefault(); fail(new Error(ev.message || "search worker failed")); };
      embedWorker.postMessage({ type: "init", dims: index.dims, vectors: index.vectors });
    })).catch((e) => { searchReady = null; throw e; }));
  const rank = async (q: string): Promise<Hit[]> => {
    await ensureSearch();
    const id = ++qid;
    const scores = await new Promise<number[]>((resolve, reject) => { pending.set(id, { resolve, reject }); embedWorker!.postMessage({ type: "query", id, text: q }); });
    return passages.map((p, i) => ({ p, score: scores[i] })).sort((a, b) => b.score - a.score);
  };

  // ---- Qwen3 0.6B via WebLLM (opt-in, WebGPU)
  let llm: any = null;
  let adapter: Promise<any> | null = null;
  const gpu = (): Promise<any> => (adapter ??= ((navigator as any).gpu?.requestAdapter() ?? Promise.resolve(null)).catch(() => null));
  const loadQwen = async () => {
    const a = await gpu();
    const model = a?.features?.has("shader-f16") ? "Qwen3-0.6B-q4f16_1-MLC" : "Qwen3-0.6B-q4f32_1-MLC";
    const webllm = await import("@mlc-ai/web-llm");
    llm = await webllm.CreateWebWorkerMLCEngine(new Worker(new URL("./llm.worker.ts", import.meta.url), { type: "module" }), model, {
      initProgressCallback: (r: { progress: number }) => {
        setProgress(r.progress, smartOpt);
        if (smartBox.checked && !llm) setStatus(`Downloading Qwen3 0.6B… ${Math.round(r.progress * 100)}%`);
      },
    });
  };

  // ---- Gemini Nano (Chrome Prompt API)
  const LM = (self as any).LanguageModel;
  let gemini: Promise<any> | null = null;
  let geminiAvailable = false;
  const ensureGemini = () =>
    (gemini ??= LM.create({
      ...LM_OPTS,
      initialPrompts: [{ role: "system", content: system() }],
      monitor(m: EventTarget) {
        m.addEventListener("downloadprogress", (e: any) => {
          setProgress(e.loaded < 1 ? e.loaded : null, geminiOpt);
          if (geminiBox.checked) setStatus(e.loaded < 1 ? `Downloading Gemini Nano… ${Math.round(e.loaded * 100)}%` : "");
        });
      },
    }).then(async (s: any) => {
      // Chromium's fake model advertises availability but only echoes the prompt/template.
      // Check generation on a disposable clone before calling it Gemini Nano.
      let probe: any;
      const question = `What is ${k.first}'s first name?`;
      try {
        probe = await s.clone();
        if ((await probe.prompt(question)).includes(question)) throw new Error("Chrome returned a prompt echo instead of a model answer.");
        return s;
      } catch (e) { s.destroy(); throw e; }
      finally { probe?.destroy(); }
    }).catch((e: unknown) => { gemini = null; throw e; }));
  if (LM) LM.availability(LM_OPTS).then((a: string) => { geminiAvailable = a !== "unavailable"; }).catch(() => {});

  // The prompt line mirrors the hidden input. Typing steps the headline back (and an empty
  // prompt brings it forward again until the first question); the toggles appear then too,
  // each only where it can run.
  // Before the first question the typing shows on the headline's prompt line; the prompt box
  // only takes over once the visitor presses Enter (or the return key on that line).
  input.addEventListener("input", () => {
    typed.textContent = heroTyped.textContent = input.value;
    if (!opts.hidden || !input.value.trim()) return;
    geminiOpt.hidden = !geminiAvailable;
    gpu().then((a) => {
      smartOpt.hidden = !a;
      opts.hidden = smartOpt.hidden && geminiOpt.hidden;
    });
    ensureSearch().catch((e: Error) => setStatus(`Search model failed to load: ${e.message}`));
  });

  const engine = () => (geminiBox.checked && gemini ? "gemini" : smartBox.checked && llm ? "smart" : "search");
  const engineNames = { search: "Résumé search · MiniLM", smart: "Qwen3 0.6B", gemini: "Gemini Nano" };
  const engineName = $<HTMLElement>(".sf-sl-engine-name");
  const showEngine = () => { engineLabel.dataset.engine = engine(); engineName.textContent = engineNames[engine()]; setStatus(""); };

  smartBox.addEventListener("change", () => {
    if (smartBox.checked) geminiBox.checked = false;
    showEngine();
    if (!smartBox.checked || llm) return;
    smartBox.disabled = true;
    setStatus("Downloading Qwen3 0.6B… 0%");
    loadQwen()
      .then(showEngine)
      .catch((e: Error) => { smartBox.checked = false; showEngine(); setStatus(`Couldn't load Qwen3: ${e.message}`); })
      .finally(() => { smartBox.disabled = false; setProgress(null, smartOpt); });
  });
  geminiBox.addEventListener("change", () => {
    if (geminiBox.checked) smartBox.checked = false;
    showEngine();
    if (!geminiBox.checked) return;
    // create() needs the user activation this change event carries.
    setStatus("Starting Gemini Nano…");
    ensureGemini()
      .then(showEngine)
      .catch((e: Error) => { geminiBox.checked = false; showEngine(); setStatus(`Gemini Nano is unavailable: ${e.message}`); })
      .finally(() => setProgress(null, geminiOpt));
  });

  // ---- Prompts
  function system() {
    return [
      `You answer questions from visitors to ${k.name}'s résumé website.`,
      ...(k.notes.length ? [`Always true, from ${k.first} himself (follow these, but mention them only when asked):\n${k.notes.map((n) => `- ${n}`).join("\n")}`] : []),
      `Use only the facts and résumé excerpts provided. If they do not contain the answer, say you don't know and suggest emailing ${k.email}.`,
      `Answer in one to three short sentences, in the third person, referring to ${k.first} by name. ${k.first} is a man: use he/him. Never invent employers, dates, numbers or skills. Do not claim linked websites contain information that is not provided here.`,
      `Use the present tense only for the current roles listed in the facts; every other role is in the past tense. For a general summary, lead with the current roles.`,
      `Keep each project with the company named in its excerpt. A previous answer is not evidence.`,
      `Past roles in the excerpts are history, not openings. Never say whether ${k.first} is or isn't open to work unless the notes above say so; otherwise reply that he hasn't said and suggest emailing ${k.email}.`,
      `Facts:\n${k.facts}`,
    ].join("\n");
  }
  // The headline the visitor was looking at counts as the assistant's opening turn, so a first
  // question like "tell me" or "what is it?" follows on from it.
  const shownLine = () => welcome.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const turns = () => {
    const opening = shownLine();
    return [...(opening ? [{ q: "", a: opening }] : []), ...history];
  };
  const excerpts = (hits: Hit[], n: number) => `Résumé excerpts:\n${hits.slice(0, n).map((h) => `- ${h.p.label}: ${h.p.text}`).join("\n")}`;
  const clean = (s: string) => s.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").trim();

  async function answerQwen(q: string, hits: Hit[], out: HTMLElement) {
    const prev = turns().at(-1);
    const messages = [
      { role: "system", content: system() },
      { role: "user", content: `${prev?.q ? `Previous question: ${prev.q}\n\n` : ""}${excerpts(hits, 5)}\n\nQuestion: ${q}` },
    ];
    const chunks = await llm.chat.completions.create({ messages, stream: true, temperature: 0.3, max_tokens: 220, extra_body: { enable_thinking: false } });
    let text = "";
    for await (const c of chunks) { text += c.choices[0]?.delta?.content ?? ""; out.textContent = clean(text); scroll(); }
    return clean(text);
  }

  async function answerGemini(q: string, hits: Hit[], out: HTMLElement) {
    const s = await (await ensureGemini()).clone();
    const prev = turns().at(-1);
    const prompt = `${prev?.q ? `Previous question: ${prev.q}\n\n` : ""}${excerpts(hits, 8)}\n\nQuestion: ${q}`;
    let text = "";
    try {
      // Chunks have been deltas since Chrome 137; older builds sent the whole text so far.
      for await (const chunk of s.promptStreaming(prompt, LM_OPTS)) {
        text = chunk.startsWith(text) && text ? chunk : text + chunk;
        const shown = text.trimStart();
        out.classList.toggle("sf-ask-a--wait", !shown);
        out.textContent = shown; scroll();
      }
    } finally { s.destroy(); }
    const answer = text.trim();
    out.textContent = answer || `Gemini Nano didn't return an answer. Try again, or switch it off to use résumé search.`;
    return answer;
  }

  // Search answers are the résumé's own words, streamed in like the models' answers.
  async function answerSearch(hits: Hit[], out: HTMLElement) {
    const best = hits[0];
    const picks = hits.filter((h) => h.score >= Math.max(MIN_SCORE, best.score - 0.08)).slice(0, 3);
    out.textContent = "";
    for (const h of picks) {
      const p = document.createElement("p");
      const text = document.createTextNode("");
      p.append(text);
      out.append(p);
      for (let i = 0; i < h.p.text.length; ) { i = Math.min(h.p.text.length, i + (reduced ? 1e9 : 3)); text.data = h.p.text.slice(0, i); scroll(); await wait(12); }
      const src = document.createElement("span");
      src.className = "sf-ask-src";
      src.textContent = h.p.label;
      p.append(src);
    }
    return picks.map((h) => h.p.text).join(" ");
  }

  // Track the visible viewport (it shrinks when a phone keyboard opens) so the chat fits above
  // the keyboard; while chatting, keep the hero pinned to the top of what is visible.
  const vv = window.visualViewport;
  const fitViewport = () => {
    if (!vv) return;
    root.style.setProperty("--sf-vvh", `${Math.round(vv.height)}px`);
    if (chatting && document.activeElement === input && window.scrollY > 0) window.scrollTo(0, 0);
    scroll();
  };
  vv?.addEventListener("resize", fitViewport);
  input.addEventListener("focus", () => setTimeout(fitViewport, 300));

  function enterChat() {
    if (chatting) return;
    chatting = true;
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    hero!.classList.add("sf-hero--ask", "sf-hero--chat");
    fitViewport();
  }

  // No visible box: clicks on the headline or prompt focus the input (this is what opens the
  // keyboard on phones), and on desktop typing anywhere near the top goes straight into it.
  const focus = () => input.focus({ preventScroll: true });
  title.addEventListener("click", focus);
  $<HTMLElement>(".sf-ask-line").addEventListener("click", focus);
  document.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || (e.key === " " && !input.value)) return;
    if (t !== document.body && !hero.contains(t)) return;
    if (t.closest("input, textarea, select, [contenteditable]") || window.scrollY > window.innerHeight * 0.5) return;
    focus();
  });
  if (matchMedia("(pointer: fine)").matches && window.scrollY < 50) focus();

  // After the first real answer from résumé search, offer a stronger model once: Qwen3 0.6B
  // where WebGPU runs it, else Gemini Nano where Chrome has it (nothing to download). "Load"
  // flips the same toggle as the prompt box's button, so download progress shows there.
  let offered = false;
  async function offerUpgrade(after: HTMLElement) {
    if (offered || engine() !== "search" || llm || gemini) return;
    offered = true;
    const useGemini = !(await gpu()) && geminiAvailable;
    if (!useGemini && !(await gpu())) return;
    const card = document.createElement("div");
    card.className = "sf-ask-offer";
    const text = document.createElement("p");
    text.textContent = useGemini
      ? "Want answers written in full sentences? Gemini Nano is built into your Chrome: nothing to download, and it runs on your device."
      : "Want answers written in full sentences? Load Qwen3 0.6B, a small AI model that runs in your browser (about 350 MB, downloaded once).";
    const load = document.createElement("button");
    load.type = "button"; load.className = "sf-ask-offer-load";
    load.textContent = useGemini ? "Use Gemini Nano" : "Load Qwen3 0.6B";
    const skip = document.createElement("button");
    skip.type = "button"; skip.className = "sf-ask-offer-skip"; skip.textContent = "Not now";
    const btns = document.createElement("div");
    btns.className = "sf-ask-offer-btns";
    btns.append(load, skip);
    card.append(text, btns);
    after.after(card);
    scroll();
    skip.addEventListener("click", () => { card.remove(); input.focus({ preventScroll: true }); });
    load.addEventListener("click", () => {
      const opt = useGemini ? geminiOpt : smartOpt;
      opts.hidden = false; opt.hidden = false;
      if (!(useGemini ? geminiBox : smartBox).checked) opt.click();
      text.textContent = useGemini
        ? "Gemini Nano is on. Your next answers will use it."
        : "Loading Qwen3 0.6B. Progress shows in the prompt box; your answers switch to it once it's ready.";
      btns.remove();
      input.focus({ preventScroll: true });
    });
  }

  async function submit(q: string) {
    if (busy) return;
    busy = true;
    enterChat();
    const turn = document.createElement("div");
    turn.className = "sf-ask-turn";
    const qEl = document.createElement("p");
    qEl.className = "sf-ask-q";
    qEl.textContent = q;
    const out = document.createElement("div");
    out.className = "sf-ask-a sf-ask-a--wait";
    turn.append(qEl, out);
    log.append(turn);
    scroll();
    try {
      let a: string;
      if (/^\s*(hi|hello|hey|salam|assalam|as-salamu)\b/i.test(q) && q.length < 24) {
        a = out.textContent = `Hello! Ask me anything about ${k.first}'s work, projects, skills or certifications.`;
      } else {
        let hits = await rank(q);
        // Short or vague follow-ups ("when does it launch?", "tell me more") lean on the previous
        // turn: the last question, or before any, the headline the visitor saw.
        const prev = turns().at(-1);
        // A bare follow-up ("tell me", "yes", "more") can match some passage weakly by accident, so
        // it always compares with the context; a question that only points back ("when does it
        // launch?") does so when it finds nothing on its own. "He"/"his" mean Hani, not the context.
        // "why?"/"how?" alone are follow-ups; "how old is he?" is a question of its own.
        const followUp = /^(tell me( more)?|more|go on|yes|yeah|sure|ok(ay)?|explain|and)\b/i.test(q.trim()) || q.trim().split(/\s+/).length <= 2;
        const pointsBack = /\b(it|its|that|this|there|they|them)\b/i.test(q);
        if (prev && (followUp || (pointsBack && hits[0]?.score < MIN_SCORE))) {
          // Drop the name and the "just ask" filler, which match every passage alike and drown the topic.
          const topic = (prev.q || prev.a)
            .replace(new RegExp(`${k.name}('s)?|\\b${k.first}('s)?\\b`, "gi"), "")
            .replace(/\b(just ask|ask away|ask me anything about it|ask me)\b[.!]?/gi, "");
          const joined = await rank(`${topic} ${q}`);
          if (joined[0]?.score > hits[0].score) hits = joined;
        }
        // "Who is he / summarise him" matches nothing in particular, so lead with the overview:
        // what he does now, his summary, and where his career began.
        // Broad work questions otherwise match incidental personal facts, such as age.
        if (/\b(summary|summari[sz]e|overview|who is|introduce|tell me about (him|hani)|what (did|does) (hani|he) do)\b/i.test(q)) {
          const pick = (label: string) => passages.filter((p) => p.label === label);
          const lead = [...pick("Now"), ...pick("About").slice(0, 2), ...pick("Career")].map((p) => ({ p, score: 1 }));
          hits = [...lead, ...hits.filter((h) => !lead.some((l) => l.p === h.p))];
        }
        // "Skills" also matches qstack's agent skills; those are software, not résumé skills.
        const label = /\bskills?\b/i.test(q) && !/\b(qstack|agent skills)\b/i.test(q) ? "Skills"
          : /\bvolunteer(?:ing)?\b/i.test(q) ? "Volunteering" : "";
        if (label) {
          const lead = hits.filter((h) => h.p.label === label).map((h) => ({ ...h, score: 1 }));
          hits = [...lead, ...hits.filter((h) => h.p.label !== label)];
        }
        const eng = engine();
        out.classList.remove("sf-ask-a--wait");
        // No passage is close enough: say so rather than let a model guess.
        if (!hits[0] || hits[0].score < MIN_SCORE) a = out.textContent = `I couldn't find that in ${k.first}'s résumé. Try asking about experience, projects, skills or certifications, or email ${k.email}.`;
        else {
          // Label the answer with the model that wrote it
          const by = document.createElement("span");
          by.className = "sf-ask-by";
          by.textContent = engineNames[eng];
          out.before(by);
          if (eng === "gemini") a = await answerGemini(q, hits, out);
          else if (eng === "smart") a = await answerQwen(q, hits, out);
          else a = await answerSearch(hits, out);
        }
      }
      history.push({ q, a });
      if (out.querySelector(".sf-ask-src")) offerUpgrade(turn);
    } catch (e) {
      out.textContent = `Something went wrong: ${(e as Error)?.message ?? e}`;
    } finally {
      out.classList.remove("sf-ask-a--wait");
      busy = false; scroll();
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || busy) return;
    input.value = typed.textContent = heroTyped.textContent = "";
    submit(q);
  });
}
