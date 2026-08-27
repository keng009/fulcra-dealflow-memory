# Live-test matrix

Dated, sanitized record of what has actually been tested against live services. "Tested" claims in the README trace here. No user data appears below; tests ran on the maintainer's own accounts.

## 2026-08-20 — Fulcra write path (official Fulcra connector, claude.ai)

| Test | Result |
|---|---|
| `get_data_catalog` inspection before creation (create-if-absent gate) | Pass — absent type correctly detected |
| `create_data_type` with `base_type: "moment"` | Pass — platform stores it as a `MomentAnnotation/<uuid>` type |
| `write_file` of README/INDEX/relationship file per the contract templates | Pass |
| `record_data` with the JSON payload in the record note, occurrence time as record timestamp | Pass |
| `get_records` read-back | Pass — payload round-trips intact; occurrence timestamp preserved (ET→UTC) |
| Soft delete (`delete_file`) + type archive (`archive_data_type`) | Pass — both reversible |
| Read-after-write lag | Observed platform behavior: reads can briefly lag writes; both skills carry the lag guard (report success from the write result; retry once on empty read-back) |

## 2026-08-20 — Attio CRM sync path (official Attio connector, claude.ai)

| Test | Result |
|---|---|
| Contact search by name (`search-records`) | Pass |
| Note creation on matched contact with key in title suffix (`create-note`) | Pass |
| Dedupe scan: list contact's notes (`search-notes-by-metadata`), find exact key in title | Pass — second write correctly skippable, zero duplicates |
| Task creation linked to contact (`create-task`) | Pass |
| No-delete confirmed (connector exposes no delete tool) | Confirmed — cleanup requires the Attio UI |

## 2026-08-20 — Idempotency (Stage-1 style)

Re-processing an identical batch against already-written notes produced **zero new writes** — every item's key was found by the per-destination scan.

## 2026-08-26 — Contract v2.1 live pass (official Fulcra connector, claude.ai)

Run against a fresh-state account (`/dealflow/` empty, no Dealflow Touchpoint type — the exact posture of a new investor account).

| Test | Result |
|---|---|
| Create-if-absent on a clean catalog (`base_type: "moment"`) | Pass |
| First capture: dual write with `company` field and volunteered `stage_noted` in both representations | Pass — payload round-trips intact |
| Same-day second touchpoint: ordinal key `touch:<slug>:<date>-2` as its own touchpoint | Pass — both retained, distinct keys in file headings and payloads |
| Duplicate retry: base key found in file AND records → zero writes | Pass |
| Self-healing partial write: entry `-3` present in file, record missing → retry wrote ONLY the missing record, file untouched | Pass |
| Stage movement data for Report: `evaluating` → `term-sheet` across same-day records, parseable per company | Pass |
| Cleanup: soft delete + type archive | Pass — reversible |

Folder initialization (README/INDEX templates) was covered by the 2026-08-20 pass; not re-run.

**Still untested**: an ambiguous CRM contact match (skip-and-say-so), and the demo skill run through Claude's actual zip-upload UI end-to-end — the latter is a human step (upload, say "run the Fulcra dealflow demo", complete a session) and should be done once before any investor walkthrough.

## 2026-08-27 — Snapshot READ side, live against a real month (Claude Google Calendar connector)

| Test | Result |
|---|---|
| Weekly-chunk sweep of a real calendar week (18 events) | Pass — attendee emails, organizers, RSVP status all present |
| Deal-flow identification on real data | Pass — external meetings correctly separable from travel blocks, holds, solo tasks, personal events |
| Findings folded back into the contract | Declined-events rule added (skip unless a transcript/CRM note shows the meeting happened — sources beat RSVP); attendee-less named meetings confirmed as ambiguous-tier, not evidence |

Zero writes performed — consistent with the snapshot's own rail. The commit/veto write mechanics reuse the API paths proven in the 2026-08-20 and 2026-08-26 passes (dual write, ordinals, self-healing, note creation, title scans); the new v3 pieces (review-queue file, CRM-origin keys, circularity guard) are prose rules over those same proven calls.

## 2026-08-27 — Snapshot → Commit → Veto, live end-to-end (Claude GCal + Otter + Attio read + official Fulcra connector)

Full flow run on the maintainer's real accounts against a fresh `/dealflow/` namespace. This was the v0.3.0 gate.

| Step | Result |
|---|---|
| 30-day snapshot sweep, weekly chunks, dual-surface calendar (Fulcra-native absent → Claude GCal connector) | Pass — ~30 deal-flow candidate events surfaced from a real month |
| Going-quiet ~60-day headline extension (new rule) | Pass — 3 extra weekly chunks; 9 quiet July threads surfaced that a 30-day window could not see |
| Declined-events rule on real data | Pass both directions — one declined event with a transcript proving it happened was KEPT (sources beat RSVP); one declined event with no source was dropped |
| Transcript enrichment (Level 3) | Pass — 7 of the kept touchpoints carried Otter summaries; keys minted as `touch:<transcript-id>` |
| CRM read-only tracked-check | Pass — 8 sampled counterparts all present in Attio, every one auto-created by sync (no narrative anywhere), zero CRM writes |
| Zero writes before consent | Pass — entire snapshot + enrichment performed no writes |
| One collective yes, with a user exclusion | Pass — user approved the batch minus one named thread; that thread was excluded before any write (17 committed of 18 shown) |
| Batch commit | Pass — folder files (README/INDEX/handoff incl. `## Vetoed keys`/review-queue), type create-if-absent, 17 relationship files + 17 typed records, mixed calendar-derived and transcript-derived keys |
| Backfill hygiene | Pass — zero open follow-ups created; every `evidence` names its exact source (`calendar backfill <date>` / `otter transcript <id>`) |
| Review-queue parking | Pass — 3 ambiguous items (attendee-less named meeting; two no-summary transcripts) parked with evidence, written nowhere else |
| Read-back | Pass — all 17 payloads round-trip intact via `get_records`; no read lag observed |
| Veto → tombstone | Pass — one committed touchpoint vetoed: relationship file soft-deleted, INDEX line removed, key added to `## Vetoed keys`; the typed record remains (no per-record delete) but the exclusion filter drops it from reads (16 of 17 surface) |

### 2026-08-27 addendum — key-scheme change + re-run and veto-read tests (post external review)

External review flagged that ordinal-by-event-order calendar keys are not stable (adding/removing an earlier same-day event could shift them). Calendar-derived commit keys moved to the stable per-source form `touch:cal:<event-id>` with a person+date cross-scan (a match on either key form means confirm, not assume). The live run above predates this and wrote date-form keys — still valid standard keys, which is exactly what the cross-scan exists to catch.

| Test | Result |
|---|---|
| Commit re-run over the same window (dedupe side) | Pass — re-derived the same batch against the live store: all 7 transcript keys matched directly; every calendar item's cross-scan found the person's date-form key (spot-checked live in file text), resolving confirm → same conversation → skip; zero writes issued |
| Vetoed key on commit re-run | Pass — the vetoed item was excluded from re-import by the `## Vetoed keys` list (read live from handoff.md) |
| Veto → Sourcing check | Pass — after the read-path fix (Sourcing now loads the vetoed-keys filter), a sourcing check on the vetoed thread returns "no history": no INDEX hit, record present but excluded |

Still untested from this flow: a first-and-second commit under the new `touch:cal:<event-id>` key form itself — the re-run above only proved the cross-scan against date-form data; it did not prove the connected calendar exposes stable event ids or that the new-key write path is duplicate-free across two runs; CRM-note-origin keys with the circularity guard (no CRM notes existed to import); the demo's per-destination record scan (added post-review; the equivalent full-skill path was live-tested 2026-08-26); injected record-only/file-only partial failures under the v3 flow (the v2.1 self-healing fill test covered the record-missing case); and the release-ZIP upload journey end to end (human step, required before any investor walkthrough).

## Untested surfaces (labeled accordingly in-product)

HubSpot (official connector is read-only — sync requires a write-capable MCP server, untested), Notion (official connector read/write, block-append scope untested), Affinity (official connector read/write, untested). See issues #4 and #5.
