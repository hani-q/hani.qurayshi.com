// What the "Ask" chat knows: the résumé split into short, self-contained passages for
// on-device semantic search, plus a few core facts every model answer is grounded in.
// Built at render time from resume.ts so the chat never drifts from the page, plus Hani's
// own notes in ABOUT.md (pronouns, availability, and anything else the résumé doesn't say).
import { resume } from "./resume";
import { summaryText, certifications, education, githubUrl } from "./derive";
import aboutMd from "./ABOUT.md?raw";

// ABOUT.md: each "- " line is one note, labelled by the "## " heading above it; HTML
// comments (unfilled slots, instructions) are skipped.
const notes = (() => {
  let label = "About";
  const out: { label: string; text: string }[] = [];
  for (const line of aboutMd.replace(/<!--[\s\S]*?-->/g, "").split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) label = h[1].trim();
    const b = line.match(/^\s*-\s+(.+)/);
    if (b) out.push({ label, text: b[1].trim() });
  }
  return out;
})();

// Shared by the build-time index (src/pages/chat-index.json.ts) and the browser worker.
export const EMBED_MODEL = "Xenova/all-MiniLM-L6-v2";

export interface Passage {
  label: string;
  text: string;
}

export interface ChatProject {
  name: string;
  role: string;
  when: string;
  where: string;
  summary: string;
  bullets: string[];
}

const skillLabels: Record<string, string> = {
  programming: "programming languages and frameworks",
  cloudDevops: "cloud and DevOps",
  databases: "databases",
  observability: "observability",
  networking: "networking",
  aiMl: "AI and machine learning",
  security: "security",
  leadership: "leadership and ways of working",
};

const short = (period: string) => period.replace(/([A-Z][a-z]+) (\d{4})/g, "$2");

export function buildKnowledge(projects: ChatProject[]) {
  const name = resume.name;
  const first = name.split(" ")[0];
  const passages: Passage[] = [];
  const add = (label: string, text: string) => passages.push({ label, text });

  const current = resume.experience.filter((j) => j.period.endsWith("Present")).map((j) => `${j.title} at ${j.company}`);
  add("Now", `What ${first} is working on and building now: currently ${current.join(" and ")}, building FlowSense.AI, agentic cyber intelligence.`);
  add("About", `${first} has ${resume.yearsOfExperience}+ years of experience across network intelligence, cloud architecture and cyber security.`);
  // Where the career began: every role at the first employer, oldest first.
  const firstJob = resume.experience[resume.experience.length - 1];
  const firstCo = resume.experience.filter((j) => j.company === firstJob.company).reverse();
  const careerStart = `${first} started his career in ${firstJob.period.split(" - ")[0]} at ${firstJob.company} in ${firstJob.location}, ${firstCo.map((j, i) => `${i ? "then as " : "first as "}${j.title} (${j.period})`).join(", ")}.`;
  add("Career", careerStart);
  add("About", summaryText);
  for (const h of resume.overview.highlights) add("About", `${h}.`);
  add(
    "Contact",
    `Email ${resume.workEmail} (work) or ${resume.email}, LinkedIn ${resume.linkedin}, X ${resume.twitter}, GitHub ${githubUrl}.`,
  );

  for (const job of resume.experience) {
    const head = `${job.title} at ${job.company}`;
    const [start, end] = job.period.split(" - ");
    add(`Experience · ${job.company}`, end === "Present" ? `${first} is currently ${head}, ${job.location}, since ${start}.` : `${first} worked as ${head}, ${job.location}, ${job.period}.`);
    for (const b of job.bullets) add(`Experience · ${job.company}`, `At ${job.company} (${job.title}, ${short(job.period)}): ${b}`);
  }

  for (const p of projects) {
    add(`Project · ${p.name}`, `${p.name}: ${p.summary} (${p.where}; ${p.when}; ${first}'s role: ${p.role}.)`);
    for (const b of p.bullets) add(`Project · ${p.name}`, `${p.name}: ${b}`);
  }

  for (const [key, list] of Object.entries(resume.skills)) {
    add("Skills", `${first}'s ${skillLabels[key] ?? key} skills: ${list.join(", ")}.`);
  }

  for (const c of certifications) add("Certifications", `Certification: ${c.name}, issued by ${c.issuer} in ${c.year}.`);
  add("Certifications", `${first}'s certifications: ${certifications.map((c) => `${c.name} (${c.issuer}, ${c.year})`).join("; ")}.`);

  add("Education", `Education: ${first} studied at ${education.school}, ${education.location}, graduating in ${education.year} with a ${education.degree} (${education.major}).`);

  for (const n of notes) add(n.label, n.text);

  const inv = resume.involvement;
  add("Volunteering", `${first} has been ${inv.role} for ${inv.organization}, ${inv.location}, since ${inv.period.split(" - ")[0]}.`);
  for (const b of inv.bullets) add("Volunteering", `At ${inv.organization}: ${b}`);

  const facts = [
    `${name}: ${resume.title}, ${resume.yearsOfExperience}+ years of experience.`,
    `Current roles: ${current.join("; ")}.`,
    careerStart,
    `Contact: ${resume.workEmail} (work), ${resume.email}, ${resume.linkedin}.`,
  ].join("\n");

  // Hani's own notes travel separately: the models get them first, on every question.
  return { name, first, email: `${resume.workEmail} or ${resume.email}`, facts, notes: notes.map((n) => n.text), passages };
}

export type ChatKnowledge = ReturnType<typeof buildKnowledge>;
