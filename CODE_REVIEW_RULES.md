# Code review rules

Repository rules for `/qstack-review`. They add to its generic baseline and win on their own subjects.

| Kind | Severity | Rule | Why |
| --- | --- | --- | --- |
| Flag | P2 | A chat-knowledge passage that hardcodes a company, title or project instead of deriving it from `resume.ts` | `src/data/chat-knowledge.ts` exists so the chat never drifts from the page |
| Flag | P1 | A model prompt that feeds a previous generated answer back as context | Both models repeated their own wrong attribution (FlowSense.AI at DNI) when it was passed back |
