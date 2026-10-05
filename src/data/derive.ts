/**
 * Derived, display-ready views of the resume data shared by every theme.
 * Themes import from here instead of re-deriving the same shapes.
 */
import { resume } from "./resume";
import contributionsData from "./contributions.json";

export interface SkillCategory {
  key: string;
  label: string;
  items: string[];
}

export const skillCategories: SkillCategory[] = [
  { key: "programming", label: "Programming & Frameworks", items: resume.skills.programming },
  { key: "cloudDevops", label: "Cloud & DevOps", items: resume.skills.cloudDevops },
  { key: "networking", label: "Networking", items: resume.skills.networking },
  { key: "aiMl", label: "AI & Machine Learning", items: resume.skills.aiMl },
  { key: "databases", label: "Databases & Storage", items: resume.skills.databases },
  { key: "observability", label: "Observability", items: resume.skills.observability },
  { key: "security", label: "Security & Compliance", items: resume.skills.security },
  { key: "leadership", label: "Leadership & Delivery", items: resume.skills.leadership },
];

export interface Cert {
  name: string;
  issuer: string;
  year: string;
}

export const certifications: Cert[] = resume.certifications.map((cert) => {
  const [name = "", issuer = "", year = ""] = cert.split("|").map((p) => p.trim());
  return { name, issuer, year };
});

export interface Education {
  degree: string;
  major: string;
  school: string;
  location: string;
  year: string;
}

const eduParts = resume.education.split("|").map((p) => p.trim());
export const education: Education = {
  degree: eduParts[0] ?? "",
  major: eduParts[1] ?? "",
  school: eduParts[2] ?? "",
  location: eduParts[3] ?? "",
  year: eduParts[4] ?? "",
};

export type Job = (typeof resume.experience)[number];

/** Experience grouped by company, preserving the original (newest-first) order. */
export const experienceByCompany: { company: string; roles: Job[] }[] = resume.experience.reduce(
  (groups: { company: string; roles: Job[] }[], job) => {
    const last = groups[groups.length - 1];
    if (last && last.company === job.company) last.roles.push(job);
    else groups.push({ company: job.company, roles: [job] });
    return groups;
  },
  [],
);

/**
 * Each employer's website, keyed by company name. `image` is a screenshot in
 * public/sites; companies whose site is gone or rebranded use a Wayback Machine
 * capture from the tenure (`archived`). No `image` means the site is offline.
 */
export interface CompanySite {
  label: string;
  url?: string;
  image?: string;
  archived?: string;
}

export const companySites: Record<string, CompanySite> = {
  "ArkaType Intelligence": { label: "www.arka-type.com", url: "https://www.arka-type.com/", image: "/sites/arkatype.jpg" },
  "Dynamic Network Intelligence (DNI)": { label: "www.dnisolutions.com", url: "https://www.dnisolutions.com/", image: "/sites/dni.jpg" },
  Sandvine: { label: "www.sandvine.com", url: "https://web.archive.org/web/20200108112459/https://www.sandvine.com/", image: "/sites/sandvine.jpg", archived: "Jan 2020" },
  SNSKIES: { label: "snskies.com", url: "https://snskies.com/", image: "/sites/snskies.jpg" },
  "Simplus Innovation": { label: "www.glasc.io", url: "https://web.archive.org/web/20240304113911/https://glasc.io/", image: "/sites/glasc.jpg", archived: "Mar 2024" },
  "Vincere Systems": { label: "vinceresystems.com" },
  "Zigron Inc.": { label: "www.zigron.com", url: "https://www.zigron.com/", image: "/sites/zigron.jpg" },
  PTCL: { label: "ptcl.com.pk", url: "https://ptcl.com.pk/", image: "/sites/ptcl.jpg" },
  "PLUMgrid Inc. (Acquired by VMware)": { label: "www.plumgrid.com", url: "https://web.archive.org/web/20160109064822/http://www.plumgrid.com/", image: "/sites/plumgrid.jpg", archived: "Jan 2016" },
  "Seamless Payments AB": { label: "seamless.se", url: "https://seamless.se/", image: "/sites/seamless.jpg" },
  "wi-tribe": { label: "www.wi-tribe.pk", url: "https://web.archive.org/web/20100617031047/http://www.wi-tribe.pk/", image: "/sites/witribe.jpg", archived: "Jun 2010" },
};

export const countries = ["UAE", "KSA", "USA", "Sweden", "Pakistan"];

export const stats = {
  years: resume.yearsOfExperience,
  companies: new Set(resume.experience.map((e) => e.company)).size,
  roles: resume.experience.length,
  certifications: resume.certifications.length,
  countries: countries.length,
  skills: skillCategories.reduce((n, c) => n + c.items.length, 0),
  engineersLed: 20,
};

/** Plain-text summary (the source contains an inline RFC 1925 anchor). */
export const summaryText = resume.overview.summary.replace(/<[^>]+>/g, "");

export const githubUrl = `https://github.com/${resume.github}`;
export const linkedinHandle = resume.linkedin.replace(/\/$/, "").split("/").pop() ?? "";
export const twitterHandle = resume.twitter.replace(/\/$/, "").split("/").pop() ?? "";

/* ---- GitHub contributions ---- */

export interface ContributionDay {
  date: string;
  contributionCount: number;
  weekday: number;
}
export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export const ghWeeks: ContributionWeek[] = (contributionsData as any).weeks ?? [];
export const ghTotal: number = (contributionsData as any).totalContributions ?? 0;
export const hasContributions = ghWeeks.length > 0;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** First week column of each month, for labelling a contribution heatmap. */
export const ghMonthLabels: { label: string; col: number }[] = (() => {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  ghWeeks.forEach((week, col) => {
    const first = week.contributionDays[0];
    if (!first) return;
    const month = new Date(first.date).getMonth();
    if (month !== lastMonth) {
      labels.push({ label: monthNames[month], col });
      lastMonth = month;
    }
  });
  return labels;
})();

export function ghLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}
