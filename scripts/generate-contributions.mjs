/**
 * Fetches GitHub contribution data via GraphQL API and generates
 * a JSON file for the HTML/CSS contribution chart.
 *
 * Usage: GH_CONTRIBUTIONS_TOKEN=xxx node scripts/generate-contributions.mjs
 */

const TOKEN = process.env.GH_CONTRIBUTIONS_TOKEN;
const USERNAME = "hani-q";
const OUTPUT_DIR = "src/data";

if (!TOKEN) {
  const { writeFileSync, mkdirSync, existsSync } = await import("fs");
  const { join } = await import("path");
  const out = join(OUTPUT_DIR, "contributions.json");
  // Keep the committed data rather than wiping it on every tokenless local build.
  if (existsSync(out)) {
    console.warn("⚠ GH_CONTRIBUTIONS_TOKEN not set — keeping existing contributions data");
    process.exit(0);
  }
  console.warn("⚠ GH_CONTRIBUTIONS_TOKEN not set — generating empty contributions data");
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(out, JSON.stringify({ totalContributions: 0, weeks: [] }));
  process.exit(0);
}

async function fetchContributions() {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                weekday
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { username: USERNAME } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data.user.contributionsCollection.contributionCalendar;
}

async function main() {
  console.log("📊 Fetching GitHub contributions for", USERNAME, "...");
  const calendar = await fetchContributions();
  console.log(`✓ Found ${calendar.totalContributions} contributions in the last year`);

  const { writeFileSync, mkdirSync } = await import("fs");
  const { join } = await import("path");

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, "contributions.json"), JSON.stringify(calendar));
  console.log("✓ Generated contributions.json");
}

main().catch((err) => {
  console.error("✗ Failed to generate contribution data:", err.message);
  // Write empty data so build doesn't fail
  import("fs").then(({ writeFileSync, mkdirSync }) => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(
      import("path").then(({ join }) => join(OUTPUT_DIR, "contributions.json")),
      JSON.stringify({ totalContributions: 0, weeks: [] })
    );
  });
  process.exit(0);
});
