---
name: dealflow-memory
description: >-
  Use when the user wants to log, recall, or review their deal-flow
  relationships — founders, fund partners, LPs, co-investors — using their
  Fulcra account as memory. Trigger on capture requests like "log my call with
  Jane", "log my meeting with the Acme founders", "I just got off a call
  with…", or a pasted block of meeting notes to file; on recall requests like
  "prep me for Jane", "prep me for tomorrow", "what do I know about Acme
  Ventures", "when did I last talk to…"; on reporting requests like "what moved
  this week", "what moved this month", "deal-flow review", "who have I gone
  quiet on", "which relationships are going stale"; and on requests to sync
  logged touchpoints to a connected CRM. Anything logged during the
  dealflow-demo skill is picked up here with no migration — but for a guided
  first-time demo session, use dealflow-demo instead of this skill.
---

# dealflow-memory

Ongoing deal-flow relationship memory on the user's own Fulcra account. Every conversation with a founder, fund partner, LP, or co-investor becomes two writes: a dated narrative entry in a per-person file under `/dealflow/relationships/`, and a structured `Dealflow Touchpoint` record. Recall ("prep me for X") and reporting ("what moved this week") read both back.

The formats embedded below are a working subset of `references/conventions.md`. That file is canonical — wherever this file and the reference differ, follow the reference.

**Namespace rule:** everything lives under `/dealflow/` in the user's Fulcra account. Never read from or write to any other folder in their account.

## Conventions summary

### Dedupe key

Every touchpoint has a deterministic key, and the key gates every write. Exact formats:

- Standard: `touch:<person-slug>:<YYYY-MM-DD>` — the date the touchpoint occurred.
- Source Level 3 (touchpoint logged from a meeting transcript): `touch:<transcript-id>` — the transcript's own id, so re-processing the same transcript cannot create a duplicate.

Person slug rule: lowercase, hyphens, from person name (`jane-doe`); append firm slug only when two people collide (`jane-doe-acme`).

The rule: **scan before every write** — the relationship file before a file write, and the contact's existing CRM note titles before a CRM write. If the key is already present, skip that write and tell the user it was already logged. Never assume a write happens exactly once.

### Provenance suffix

Every derived entry — relationship-file touchpoints, `### Earlier` digest lines, typed records — ends with a provenance suffix in exactly this format:

`[<producer> | <evidence> | <ISO-8601 timestamp with timezone>]`

- `producer` — here, always `dealflow-memory`.
- `evidence` — what the entry was derived from. Examples: `user account` (the user said it in conversation), `user account, calendar 2026-08-20` (a calendar event corroborates it), `otter transcript abc123` (a transcript source).
- Timestamp — when the entry was written, ISO-8601 with timezone (e.g. `2026-08-20T17:30-04:00`).

Agent conclusions are always represented as derived data carrying this suffix — never as source observations.

### Relationship file template

New relationship files start from this shape, and every logged touchpoint follows the `###` block exactly:

```markdown
# Jane Doe — Acme Ventures (GP)
Context: one line on who they are and why they matter.

## Open follow-ups
- [ ] Send the Q3 memo (from 2026-08-20 call)

## Touchpoints
### 2026-08-20 — call [touch:jane-doe:2026-08-20]
Summary: 2-5 sentences.
Follow-ups: ...
[dealflow-memory | user account, calendar 2026-08-20 | 2026-08-20T17:30-04:00]
```

Rules: touchpoints ordered newest first; keep each file to roughly two pages — past that, consolidate the oldest touchpoints into a single `### Earlier` digest at the bottom (a few summary lines, keeping the dedupe key of each consolidated touchpoint listed so a dedupe scan still finds it); every touchpoint carries its key in the heading and the provenance suffix as its last line.

### Dealflow Touchpoint payload

A MomentAnnotation record carries its structured payload as JSON in the record's note field. The payload fields:

`{"person","firm","channel":"call|meeting|email|event|other","summary","follow_ups":[],"producer","evidence","recorded_at"}`

A filled example:

```json
{
  "person": "Jane Doe",
  "firm": "Acme Ventures",
  "channel": "call",
  "summary": "2-5 sentences on what was discussed and any decisions.",
  "follow_ups": ["Send the Q3 memo"],
  "producer": "dealflow-memory",
  "evidence": "user account, calendar 2026-08-20",
  "recorded_at": "2026-08-20T17:30-04:00"
}
```

- `channel` is exactly one of: `call`, `meeting`, `email`, `event`, `other`.
- `follow_ups` is an array of strings; an empty array when there are none.
- The record's timestamp is when the touchpoint occurred — not when it was logged. (`recorded_at` in the payload is when it was logged; the two differ whenever a touchpoint is logged after the fact.)

## Bootstrap (every fresh session)

Run this before acting on any request. Keep the spoken output short — two or three sentences, not a status report.

1. **Preflight.** Confirm the Fulcra tools are available (`get_data_catalog`, `list_files`, `read_file`, `write_file`, `create_data_type`, `record_data`, `get_records`). If they are not, stop and say exactly what to do: "Fulcra isn't connected. In Claude, go to Settings → Connectors and connect Fulcra, then try again." Never fake success or pretend data exists.

2. **Timezone.** Call `get_user_info` and use the user's timezone for every timestamp you write (provenance suffixes, `recorded_at`, record timestamps). Always pass a timezone when a Fulcra tool takes one.

3. **Catalog.** Call `get_data_catalog`. Note whether the `Dealflow Touchpoint` data type already exists (this decides create-vs-skip later) and whether calendar data is present.

4. **Folder.** Call `list_files` on `/dealflow/`. If `README.md`, `INDEX.md`, or `handoff.md` is missing, this is a first run: create the missing ones with `write_file` from the templates below, then add a line to `INDEX.md` for each file created. If the folder exists, read `INDEX.md` to learn what is already stored. Fulcra files are versioned — writing to an existing path creates a new version rather than destroying the old one — so read-modify-write is safe.

   `/dealflow/README.md`:

   ```markdown
   # Dealflow Memory

   This folder is written by the dealflow-demo and dealflow-memory Claude
   skills. It holds deal-flow relationship memory: one narrative file per
   person under relationships/, a typed Dealflow Touchpoint record per logged
   touchpoint, and a durable handoff file.

   Conventions: references/conventions.md inside the dealflow-memory skill
   folder is the canonical data contract for everything here.

   Rule: no credentials, tokens, or secrets are ever written to any file in
   this folder.
   ```

   `/dealflow/INDEX.md`:

   ```markdown
   # /dealflow/ index

   - README.md — what this folder is and the rules for writing to it
   - INDEX.md — this file
   - handoff.md — open follow-ups, pending intros, next actions
   ```

   `/dealflow/handoff.md`:

   ```markdown
   # Handoff

   ## Open follow-ups
   (none yet)

   ## Pending intros
   (none yet)

   ## Next actions
   (none yet)
   ```

5. **Detect sources and state the level.** Detect, don't require:

   - **Level 1 — Fulcra only.** Conversational capture and recall work fully.
   - **Level 2 — + calendar.** The catalog shows calendar data, or `get_calendar_events` over the past and next 7 days returns events. Unlocks: touchpoints corroborated against real meetings, and "prep me for tomorrow" reading the actual calendar.
   - **Level 3 — + transcript source.** A transcript tool (Otter, Zoom, Fireflies, or similar) is among the connected tools. Unlocks: logging touchpoints straight from meeting transcripts.

   State the detected level in one line, and in one more line what connecting the next source would unlock — for example: "I've got Fulcra and your calendar (Level 2). Connect a transcript tool like Otter and I can log meetings straight from transcripts." Do not lecture; do not repeat this if the session already covered it.

6. **Detect CRM and offer sync (never require it).** If tools that can search contacts and create notes are connected (tested: Attio; HubSpot, Notion, and Affinity follow the same shape — see `references/crm-sync.md`), offer once per session: "You have [CRM] connected. Want me to also copy each logged touchpoint there as a note on the matched contact? One-way — I never create contacts or touch fields and stages." Respect the answer for the rest of the session. If no CRM tools are present, never mention CRM at all — no offers, no errors.

## Capture

Trigger: "log my call with Jane", "log my meeting with the Acme founders", "I just got off a call with…", a pasted block of notes, or (Level 3) "log my meetings from this week".

1. **Gather the fields:** person, firm, channel (exactly one of `call`, `meeting`, `email`, `event`, `other`), date the touchpoint occurred, a 2-5 sentence summary, and any follow-ups. Ask at most 5 questions, and only for what is missing. If the user pastes notes or a transcript, extract the fields from the paste and confirm them in a single message instead of asking questions. If no date is given, default to today in the user's timezone.

2. **Corroborate (Level 2).** If calendar is connected, call `get_calendar_events` around the touchpoint date and look for a matching event (person's name or email among attendees, plausible time). If one matches, use the event's start time as the record timestamp and include `calendar <YYYY-MM-DD>` in the evidence, e.g. `user account, calendar 2026-08-20`. If nothing matches, proceed with what the user said and evidence `user account`.

3. **Transcript capture (Level 3).** When logging from a transcript: list the user's recent transcripts, let them pick, and distill each chosen transcript into the same fields (summary stays 2-5 sentences). The dedupe key is `touch:<transcript-id>` — the transcript's own id — and the evidence names the source, e.g. `otter transcript abc123`.

4. **Compute slug and key.** Slug the person's name (lowercase, hyphens: `jane-doe`). Check `/dealflow/relationships/` for an existing file: same person → use their file; a *different* person already holding that slug → append the firm slug (`jane-doe-acme`). Standard key: `touch:<person-slug>:<YYYY-MM-DD>` with the date the touchpoint occurred.

5. **Dedupe scan.** If the relationship file exists, read it and scan the full text for the key — headings and the `### Earlier` digest both count. If the key is present, skip the file write and the typed record (they are written as a pair), tell the user it was already logged and when, and go straight to step 9 for the CRM check (which has its own scan). If the user says a previous log only half-completed, verify each store individually — file scan, `get_records`, CRM note-title scan — and fill only what is missing.

6. **Write the relationship file.** New person: create `/dealflow/relationships/<slug>.md` from the template, filling the title line and Context line from what you know. Existing person: read the file and insert the new `###` block directly under `## Touchpoints` (newest first), and add any new follow-ups as `- [ ]` lines under `## Open follow-ups` in the form `- [ ] Send the Q3 memo (from 2026-08-20 call)`. The `###` block must follow the template exactly: heading `### <YYYY-MM-DD> — <channel> [<key>]`, a `Summary:` line, a `Follow-ups:` line (or `Follow-ups: none`), and the provenance suffix as the last line with producer `dealflow-memory`. If the file has grown past roughly two pages, consolidate the oldest touchpoints into a single `### Earlier` digest at the bottom — a few summary lines that keep every consolidated touchpoint's dedupe key listed. Write the result with `write_file`.

7. **Write the typed record.** If the bootstrap catalog check showed no `Dealflow Touchpoint` type, create it now with `create_data_type` (name `Dealflow Touchpoint`, `base_type: "moment"` — the platform stores it as a MomentAnnotation type) — create-if-absent, safe on re-runs; never create it blind without the catalog check. Then `record_data` one record: timestamp = when the touchpoint occurred (user's timezone), note field = the JSON payload from the Conventions summary, with `producer` = `dealflow-memory`, `evidence` matching the file entry's evidence, and `recorded_at` = now.

8. **Upkeep.** If a new relationship file was created, add one line to `/dealflow/INDEX.md`: `- relationships/<slug>.md — <Person Name> (<Firm>)`. Add each new follow-up to `/dealflow/handoff.md` under `## Open follow-ups` as `- [ ] <follow-up> — <Person Name> (from <YYYY-MM-DD> <channel>)`; record any promised intros under `## Pending intros`. Remove a `(none yet)` placeholder when adding the first real line.

9. **CRM note (only if sync was offered and accepted this session).** Consult `references/crm-sync.md` for the per-CRM mapping. The generic flow:
   - Look up the contact by email first, then by name. **No match → skip the CRM write and say so.** Never create a CRM contact.
   - Scan the contact's existing note titles for the key. Present → skip and tell the user the CRM copy already exists.
   - Absent → create one note. Title: `<Channel> with <Person> — <YYYY-MM-DD>` ending with the key in square brackets, e.g. a title ending `[touch:jane-doe:2026-08-20]`. Body: a `Summary:` line, the follow-ups as a list (or `Follow-ups: none`), and a final `Source:` line carrying the provenance trio — `Source: dealflow-memory | <evidence> | <timestamp>` — exactly per the Note format section of `references/crm-sync.md`.
   - Where the CRM's tools support tasks linked to a contact, offer to create one task per follow-up.
   - Never edit CRM fields, stages, amounts, or any other attribute. Notes and tasks only. The CRM remains the user's system of record for pipeline; Fulcra holds the narrative and the typed records.

10. **Confirm.** Close with one or two lines: what was written, where — e.g. "Logged: jane-doe.md updated, Dealflow Touchpoint recorded, Attio note added." Fulcra reads can briefly lag writes; after a successful write, report success from the write result rather than re-reading to verify and concluding failure.

## Recall

Trigger: "prep me for Jane", "what do I know about Acme Ventures", "when did I last talk to X", "prep me for tomorrow".

1. Resolve the person to a slug and read `/dealflow/relationships/<slug>.md`. For a firm-level question, check `INDEX.md` for everyone at that firm and read each file.
2. Call `get_records` for `Dealflow Touchpoint` over a wide window (the last 12 months is a sensible default), parse each record's note-field JSON, and keep the records whose `person` matches. This catches anything logged by another assistant against the same account.
3. At Level 2+, call `get_calendar_events` to find the next upcoming event with the person (name or email among attendees) — when it is, and who else is attending. For "prep me for tomorrow", start from tomorrow's calendar instead: pull the day's events, match attendees to relationship files, and produce a short brief per matched person.
4. Output a brief, grounded only in what is stored:
   - **Who they are** — the Context line and firm.
   - **Last touchpoint** — date, channel, one-line summary; note how long ago it was.
   - **Open follow-ups** — unchecked items from their file and any of theirs in `handoff.md`; flag which are yours to deliver.
   - **Suggested talking points** — derived from the stored touchpoints and follow-ups. Label anything speculative as speculative.
   - **Next meeting** (Level 2+) — when, and other attendees.
5. If nothing is stored for the person, say so plainly — "I don't have anything on Jane yet — want to log your last conversation with her?" — and offer to capture. Never pad a brief with invented or generic content.

The spoken brief is conversational output and needs no provenance suffix; but if the user asks to *save* a brief or any conclusion to a file, it is derived data and carries the suffix.

## Report

Trigger: "what moved this week", "what moved this month", "deal-flow review", "who have I gone quiet on".

1. **Window.** "This week" → the last 7 days; "this month" → the last 30 days; otherwise use the range the user names.
2. **Activity.** `get_records` for `Dealflow Touchpoint` over the window; parse the note-field JSON payloads. Report touchpoints per relationship (person — firm — count — channels).
3. **New vs. ongoing.** A relationship is *new* if its earliest touchpoint falls inside the window — check the bottom of its relationship file (including keys listed in the `### Earlier` digest) rather than assuming the window's records are the whole history.
4. **Open follow-ups.** Unchecked items from `/dealflow/handoff.md`, oldest first — plus any unchecked `- [ ]` items found under `## Open follow-ups` in the relationship files read in the next step that are missing from `handoff.md` (the demo skill writes follow-ups only to relationship files; catch them here and add them to `handoff.md` while you are at it).
5. **Stale alert (45+ days).** `list_files` on `/dealflow/relationships/`, read each file, and take the date from the first `###` heading under `## Touchpoints` (entries are newest first, so the first heading is the latest touchpoint). Anyone whose latest touchpoint is 45 or more days old goes on a "going quiet" list with days-since-contact, sorted most-stale first. Skip files with no touchpoints yet, and say so if any exist.
6. Output four short sections: **Activity**, **New vs. ongoing**, **Open follow-ups**, **Going quiet (45+ days)**. Keep it scannable — a partner should get the picture in fifteen seconds. If the window contains no touchpoints, say exactly that; do not scrape other data to fill space.

## Rails

- **Namespace.** Never write outside `/dealflow/`. Never touch other folders in the user's Fulcra account.
- **No secrets.** No credentials, tokens, or secrets are ever written to any file in `/dealflow/` — if the user pastes one inside meeting notes, leave it out of everything written.
- **Drafts only.** Never send an email or message on the user's behalf. If asked to follow up with someone, produce text clearly labeled as a draft and hand it over.
- **CRM boundaries.** Sync is one-way (Fulcra → CRM), offered never required, notes and tasks only. Never create CRM contacts. Never edit CRM fields, stages, or amounts. Attio is the tested CRM; when using another, say honestly that it is designed-for but untested.
- **Dedupe before every write.** Relationship file scan before a file write; CRM note-title scan before a CRM write. A found key means skip and say so. Never assume exactly-once.
- **Provenance.** Every entry written to a file or record is derived data and carries the provenance suffix. Never present a conclusion as a source observation.
- **Degrade gracefully.** On any missing tool or failed call, say plainly what is missing or failed and what connecting or retrying would unlock — then do what is still possible. Never fake success, and never invent stored data.
