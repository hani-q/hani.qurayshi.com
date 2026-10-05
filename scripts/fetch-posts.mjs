/**
 * Fetches the X posts listed in src/data/pinned-posts.json through X's public
 * single-post endpoint (the one X's own embeds use; no API key) and saves their
 * text, stats and images into the repo, so the site renders them natively and
 * visitors load nothing from X.
 *
 * Output: src/data/posts.json and public/posts/<id>-<n>.jpg (plus the avatar).
 * A post that fails to fetch keeps its previously saved copy, so builds never
 * lose data when X is unreachable.
 *
 * Usage: node scripts/fetch-posts.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

const IDS_FILE = "src/data/pinned-posts.json";
const OUT_FILE = "src/data/posts.json";
const IMG_DIR = "public/posts";
const UA = { "User-Agent": "Mozilla/5.0 (resume site build)" };

const ids = JSON.parse(readFileSync(IDS_FILE, "utf8"));
const previous = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, "utf8")) : [];
mkdirSync(IMG_DIR, { recursive: true });

async function fetchBytes(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function save(bytes, file) {
  writeFileSync(join(IMG_DIR, file), bytes);
  return `/posts/${file}`;
}

/** Plain text without the trailing t.co media link; mentions and links become segments. */
function segments(post) {
  const [start, end] = post.display_text_range ?? [0, post.text.length];
  const chars = Array.from(post.text);
  const marks = [
    ...(post.entities?.user_mentions ?? []).map((m) => ({ ...m, kind: "mention" })),
    ...(post.entities?.urls ?? []).map((u) => ({ ...u, kind: "url" })),
  ].filter((m) => m.indices[0] >= start && m.indices[1] <= end).sort((a, b) => a.indices[0] - b.indices[0]);
  const out = [];
  let i = start;
  for (const m of marks) {
    if (m.indices[0] > i) out.push({ text: chars.slice(i, m.indices[0]).join("") });
    if (m.kind === "mention") out.push({ text: `@${m.screen_name}`, href: `https://x.com/${m.screen_name}` });
    else out.push({ text: m.display_url, href: m.expanded_url });
    i = m.indices[1];
  }
  if (i < end) out.push({ text: chars.slice(i, end).join("") });
  return out.map((s) => (s.href ? s : { text: s.text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") }));
}

const posts = [];
for (const id of ids) {
  try {
    const res = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=a`, { headers: UA });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const p = await res.json();
    // X sometimes serves byte-identical files for separate attachments; show each image once.
    const photos = [];
    const seen = new Set();
    for (const ph of p.photos ?? []) {
      const bytes = await fetchBytes(`${ph.url}?name=medium`);
      const hash = createHash("sha1").update(bytes).digest("hex");
      if (seen.has(hash)) continue;
      seen.add(hash);
      photos.push({ src: save(bytes, `${id}-${photos.length + 1}.jpg`), width: ph.width, height: ph.height });
    }
    const avatar = save(await fetchBytes(p.user.profile_image_url_https.replace("_normal", "_200x200")), "avatar.jpg");
    posts.push({
      id,
      url: `https://x.com/${p.user.screen_name}/status/${id}`,
      createdAt: p.created_at,
      likes: p.favorite_count ?? 0,
      replies: p.conversation_count ?? 0,
      author: { name: p.user.name, handle: p.user.screen_name, avatar, verified: !!p.user.is_blue_verified },
      segments: segments(p),
      photos,
    });
    console.log(`✓ Post ${id}`);
  } catch (err) {
    const kept = previous.find((p) => p.id === id);
    if (kept) posts.push(kept);
    console.warn(`⚠ Post ${id} not fetched (${err.message}); ${kept ? "keeping saved copy" : "skipping"}`);
  }
}

writeFileSync(OUT_FILE, JSON.stringify(posts, null, 2) + "\n");
console.log(`✓ Wrote ${posts.length} post(s) to ${OUT_FILE}`);
