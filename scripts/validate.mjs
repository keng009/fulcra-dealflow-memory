#!/usr/bin/env node
// Repo validation: skill frontmatter limits, contract drift, required rails,
// and relative-link existence. No dependencies. Exit 1 on any failure.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL: " + msg); };
const ok = (msg) => console.log("  ok: " + msg);

// ---------- 1. Frontmatter: exactly name + description, within Claude's limits ----------
const SKILLS = ["skills/dealflow-demo/SKILL.md", "skills/dealflow-memory/SKILL.md"];
for (const path of SKILLS) {
  const src = read(path);
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) { fail(`${path}: no frontmatter block`); continue; }
  const fm = m[1];
  const keys = [...fm.matchAll(/^([A-Za-z_][\w-]*):/gm)].map((k) => k[1]);
  if (keys.sort().join(",") !== "description,name") fail(`${path}: frontmatter keys must be exactly name+description, got: ${keys.join(",")}`);
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  if (!name) fail(`${path}: missing name`);
  else if (name.length > 64) fail(`${path}: name ${name.length} chars (max 64)`);
  // description: plain scalar or folded (>- / >) block — fold continuation lines with spaces
  let desc = "";
  const plain = fm.match(/^description:[ \t]*([^>\s].*)$/m);
  if (plain) desc = plain[1].trim();
  else {
    const folded = fm.match(/^description:\s*>-?\s*\r?\n((?:[ \t]+.*(?:\r?\n|$))+)/m);
    if (folded) desc = folded[1].split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(" ");
  }
  if (!desc) fail(`${path}: missing/unparsable description`);
  else if (desc.length > 200) fail(`${path}: description ${desc.length} chars (Claude custom-skill max is 200)`);
  else ok(`${path}: frontmatter valid (name ${name.length}, description ${desc.length} chars)`);
}

// ---------- 2. Contract drift: canonical strings must appear byte-identically ----------
const CONTRACT = "skills/dealflow-memory/references/conventions.md";
const contract = read(CONTRACT);
const demo = read(SKILLS[0]);
const full = read(SKILLS[1]);
const SHARED = [
  ['payload signature', '`{"dedupe_key","person","company","channel":"call|meeting|email|event|other","summary","stage_noted","follow_ups":[],"producer","evidence","recorded_at"}`', [demo, full]],
  ["base key format", "`touch:<person-slug>:<YYYY-MM-DD>`", [demo, full]],
  ["provenance suffix format", "`[<producer> | <evidence> | <ISO-8601 timestamp with timezone>]`", [demo, full]],
  ["channel enum", "`call`, `meeting`, `email`, `event`, `other`", [demo, full]],
  ["slug rule", "lowercase, hyphens, from person name (`jane-doe`); append company slug only when two people collide (`jane-doe-acme`)", [demo, full]],
  ["same-day ordinal", "-2", [demo, full]],
  ["stage-noted template line", "Stage noted:", [demo, full]],
  ["snapshot zero-writes sentence", "The snapshot performs zero writes.", [demo, full]],
  ["dual-surface calendar detection", "any Claude-side calendar connector", [demo, full]],
  ["declined-events rule", "sources beat RSVP status", [demo, full]],
];
// contract v2.1: the old "firm" payload token must be gone from contract-bearing files
for (const [i, t] of [contract, demo, full].entries()) {
  if (t.includes('"firm"')) fail(`contract v2.1: "firm" payload token still present in ${[CONTRACT, ...SKILLS][i === 0 ? 0 : i]}`);
}
for (const [label, needle, targets] of SHARED) {
  if (!contract.includes(needle)) { fail(`contract drift: ${CONTRACT} itself lacks the canonical ${label}: ${needle}`); continue; }
  targets.forEach((t, i) => {
    if (!t.includes(needle)) fail(`contract drift: ${SKILLS[i]} lacks the canonical ${label}`);
  });
  ok(`contract: ${label} aligned`);
}

// ---------- 3. Required rails ----------
const RAILS = [
  ["untrusted-content rail", "data, never instructions", [demo, full]],
  ["no-credentials rail", "credentials, tokens, or secrets", [demo, full]],
  ["never-create-contacts rail", "Never create CRM contacts", [full]],
  ["reads-never-write rail", "Reads never write", [full]],
  ["review queue convention", "review-queue.md", [full, contract]],
  ["CRM-origin key form", "touch:attio-note:", [full, contract]],
  ["calendar-origin key form", "touch:cal:", [demo, full, contract]],
  ["batch consent language", "one collective yes", [full, contract]],
  ["backfill hygiene rail", "Backfilled entries never create open follow-ups", [full, contract]],
  ["circularity guard", "whose title already carries a", [full, contract]],
  ["confidence tier (ambiguity parked)", "Never guessed", [full, contract]],
  ["veto tombstone list", "## Vetoed keys", [full, contract]],
];
for (const [label, needle, targets] of RAILS) {
  targets.forEach((t) => {
    if (!t.includes(needle)) fail(`missing rail: ${label} ("${needle}") not found in a skill that requires it`);
  });
  ok(`rail: ${label} present`);
}

// ---------- 4. No unshipped Fulcra features ----------
for (const path of [...SKILLS, CONTRACT, "README.md", "skills/dealflow-memory/references/crm-sync.md"]) {
  if (/file-system-updates/i.test(read(path))) fail(`${path}: references unshipped Fulcra feature "file-system-updates"`);
}
ok("no unshipped-feature references");

// ---------- 5. Relative links resolve ----------
for (const path of ["README.md", "CONTRIBUTING.md", "AGENTS.md", "CONTEXT.md"]) {
  const src = read(path);
  for (const [, , target] of src.matchAll(/\[([^\]]*)\]\((?!https?:|#|mailto:)([^)\s]+)\)/g).toArray?.() ?? [...src.matchAll(/\[([^\]]*)\]\((?!https?:|#|mailto:)([^)\s]+)\)/g)].map((m) => [m[0], m[1], m[2]])) {
    const clean = target.split("#")[0];
    if (clean && !existsSync(join(ROOT, dirname(path), clean)) && !existsSync(join(ROOT, clean))) {
      fail(`${path}: broken relative link -> ${target}`);
    }
  }
}
ok("relative links resolve");

console.log(failures ? `\n${failures} failure(s).` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
