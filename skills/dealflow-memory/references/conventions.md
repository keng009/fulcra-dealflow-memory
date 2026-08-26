# Dealflow Memory — data conventions

The shared data contract for the `dealflow-demo` and `dealflow-memory` skills: where files live in the user's Fulcra account, how touchpoint entries are formatted, how duplicates are prevented, and how derived data is labeled.

**This file is canonical.** Skills that embed a subset of these conventions inline must defer to this file wherever the two differ.

**Namespace:** everything lives under `/dealflow/` in the user's Fulcra account — never touch other folders in their account.

## File tree

| Path | Content |
|---|---|
| `/dealflow/README.md` | What this folder is, which skills write to it, a pointer to these conventions, and the no-credentials rule: no credentials, tokens, or secrets are ever written to any file in this folder. |
| `/dealflow/INDEX.md` | One line per file in the folder. Read at bootstrap; updated whenever a file is added. |
| `/dealflow/relationships/<slug>.md` | One narrative file per person (founder, fund partner, LP, co-investor). Dated touchpoint entries, newest first. |
| `/dealflow/handoff.md` | Durable handoff: open follow-ups, pending intros, next actions. |

## Relationship file format

Literal template — new relationship files start from this shape, and every logged touchpoint follows the `###` block exactly:

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

Rules:

- Touchpoints are ordered newest first.
- Keep each file to roughly two pages. When it grows past that, consolidate the oldest touchpoints into a single `### Earlier` digest at the bottom — a few summary lines, keeping the dedupe key of each consolidated touchpoint listed so a dedupe scan still finds it.
- Every touchpoint carries its dedupe key in the heading and a provenance suffix as its last line (formats below).

## Dedupe key

Exact formats:

- Standard: `touch:<person-slug>:<YYYY-MM-DD>` — the date the touchpoint occurred.
- Additional same-day touchpoints: append the next unused ordinal — `touch:<person-slug>:<YYYY-MM-DD>-2`, then `-3`, and so on. Two real conversations with the same person on the same day are two touchpoints, not a duplicate.
- Source Level 3 (touchpoint logged from a meeting transcript): `touch:<transcript-id>` — the transcript's own id, so re-processing the same transcript cannot create a duplicate.

Person slug rule: lowercase, hyphens, from person name (`jane-doe`); append firm slug only when two people collide (`jane-doe-acme`).

Where the key appears:

- Relationship-file entry headings: `### 2026-08-20 — call [touch:jane-doe:2026-08-20]`
- The typed record's payload `dedupe_key` field
- CRM note title suffixes (when CRM sync is on): the note title ends with `[touch:jane-doe:2026-08-20]`

The rules:

1. **Scan before every write, per destination.** Each representation is checked against its own store — the relationship file's text before a file write, the typed records (via `get_records`, matching payload `dedupe_key`) before a record write, the contact's existing CRM note titles before a CRM write. Write only the representations that are missing; this makes a partially completed earlier write self-healing on retry rather than half-skipped. When some representations existed and some were just filled in, say so.
2. **A matched key means confirm, not assume.** When a capture's base key (or any of its ordinals) is already present, ask the user: same conversation → it is a duplicate, skip whatever already exists; a different conversation that day → use the next unused ordinal and log it as its own touchpoint.
3. Never assume a write happens exactly once.

## Dealflow Touchpoint data type

- Name: `Dealflow Touchpoint`
- Base: MomentAnnotation (created by calling `create_data_type` with `base_type: "moment"` — the platform stores it as a `MomentAnnotation/<uuid>` type in the catalog)
- Creation: create-if-absent. Check `get_data_catalog` for an existing `Dealflow Touchpoint` type first; call `create_data_type` only if it is not there. Safe on re-runs.
- Record payload: a MomentAnnotation record carries its structured payload as JSON in the record's note field. The payload fields:

  `{"dedupe_key","person","firm","channel":"call|meeting|email|event|other","summary","follow_ups":[],"producer","evidence","recorded_at"}`

  A filled example:

  ```json
  {
    "dedupe_key": "touch:jane-doe:2026-08-20",
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

- `dedupe_key` is the touchpoint's key (formats above) — it is what the per-destination record scan matches on.
- `channel` is exactly one of: `call`, `meeting`, `email`, `event`, `other`.
- `follow_ups` is an array of strings; an empty array when there are none.
- `producer`, `evidence`, `recorded_at` are the provenance trio (see Provenance).
- The record's timestamp is when the touchpoint occurred — not when it was logged. (`recorded_at` in the payload is when it was logged; the two differ whenever a touchpoint is logged after the fact.)

## Provenance

Every derived entry — relationship-file touchpoints, `### Earlier` digest lines, typed records — carries a provenance suffix in exactly this format:

`[<producer> | <evidence> | <ISO-8601 timestamp with timezone>]`

- `producer` — the skill that wrote it: `dealflow-demo` or `dealflow-memory`.
- `evidence` — what the entry was derived from. Examples: `user account` (the user said it in conversation), `user account, calendar 2026-08-20` (a calendar event corroborates it), `otter transcript abc123` (a transcript source).
- Timestamp — when the entry was written, ISO-8601 with timezone (e.g. `2026-08-20T17:30-04:00`).

Agent conclusions are always represented as derived data carrying this suffix — never as source observations.

## Fulcra tools used

- Catalog inspection (bootstrap, and the create-if-absent check) → `get_data_catalog`
- Files → `list_files` / `read_file` / `write_file` — files are versioned: writing to an existing path creates a new version rather than destroying the old one
- Typed records → `create_data_type` / `record_data` / `get_records`
- Calendar (source Level 2) → `get_calendar_events`
