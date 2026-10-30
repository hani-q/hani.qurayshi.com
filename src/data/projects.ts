// ArkaType's product and the open-source work, shown as website windows; each
// opens the shared browser dialog.
export const products = [
  {
    id: "sf-proj-flowsense",
    name: "FlowSense.AI",
    kicker: "ArkaType Intelligence · macOS",
    tagline: "Agentic Cyber Intelligence. Every flow, identified in real time.",
    when: "Launching 2026",
    where: "macOS app by ArkaType Intelligence",
    site: { label: "getflowsense.com", image: "/sites/flowsense.jpg", tag: "Launching Soon" },
    role: "ArkaType Intelligence's First Product",
    summary: "A Mac app that identifies every network flow on-device. Write traffic rules in FlowRuby or let your agents write them, then see what changed in plain English.",
    bullets: [
      "Names every flow in real time with a carrier-grade packet intelligence engine: 1,400+ signatures, TLS and QUIC included, reading a passive copy of the interface without decrypting anything, at about 16% of one core at 1 GbE line rate.",
      "Live view of the last sixty seconds, then a tree of application, app, hostname and flow with up and down rates, trend, flow count and round-trip time, plus process attribution where macOS allows it.",
      "A daily briefing instead of a dashboard, written on the Mac by Apple Intelligence or a local model in one of seven personas, with follow-up questions by chat or voice.",
      "FlowRuby, a language for policies and custom signatures: scope rules by app, device or destination, set schedules and expiring rules, and recognize your own services from hostnames or packet contents, written by hand or by agents.",
      "Auto mode: a typed decision model blocks, shapes or prioritizes traffic on its own, and every action lands in an undoable journal with its reason and the rule it wrote. Off by default.",
    ],
  },
];

export const openSource = [
  {
    id: "sf-proj-qstack",
    name: "qstack",
    kicker: "Open Source · MIT",
    tagline: "Plans you can review and agents that follow them.",
    when: "2026",
    where: "GitHub · Claude Code, Codex",
    site: { label: "github.com/hani-q/qstack", url: "https://github.com/hani-q/qstack", image: "/sites/qstack.jpg", tag: "Open Source" },
    role: "Author and Maintainer",
    summary: "33 agent skills for Claude Code and Codex. They turn plans into documents you can review, guide agents through the work, and save what you learned.",
    bullets: [
      "33 skills for Claude Code, Codex and other agents that read ~/.agents/skills, maintained in one checkout and published on skills.sh.",
      "Turns a Markdown draft or a chat into a numbered HTML plan, with a high-level half for whoever approves the work and a low-level half for the agent, so review feedback can cite clauses like §4.2.",
      "Execution loops work the plan card by card, keep a running execution.md and ask how much adversarial review to run; an adherence review then scores the outcome from 0 to 5 against the plan, the record and the diff.",
      "A review skill scores code against a correctness baseline plus the repository's CODE_REVIEW_RULES.md, and plan-close and prior-art skills carry what work actually cost into the next plan instead of growing AGENTS.md.",
      "Ten engineering-practice skills adapted from Lauren Tan's PStack: diagnose before patching, prove the real artifact runs, separate ownership before reaching for a lock.",
    ],
  },
];
