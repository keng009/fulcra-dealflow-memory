# Changelog

User-visible changes to the skill packet. Format follows [Keep a Changelog](https://keepachangelog.com/); versions are [release tags](https://github.com/keng009/fulcra-dealflow-memory/releases) with ready-to-upload zips attached. Live-behavior evidence for every claim: [docs/testing.md](docs/testing.md).

## [Unreleased] — v0.3.0, the snapshot-first flow (branch `flow/snapshot-first`, PR #28)

### Added
- **Snapshot**: read-only analysis of the last 30 days of deal flow (calendar on either surface — Fulcra or a Claude-side connector — plus transcripts and a read-only CRM check), shown before anything is stored. The snapshot performs zero writes.
- **Commit**: one collective yes converts the snapshot to stored memory (ADR-0005); ambiguous items are parked in `/dealflow/review-queue.md` with their evidence, never guessed; per-item review always available.
- **Veto tombstone**: typed records have no per-record delete, so a vetoed touchpoint's key goes on `handoff.md`'s `## Vetoed keys` list — every read these skills perform (Recall, Report, Sourcing) excludes it and no commit re-imports it; readers outside the skills must apply the list themselves.
- **Sourcing check** ("seen this company before?") and **Tend** (deltas, vetoes, queue rulings, staleness at scale per ADR-0006).
- Demo runs snapshot-first (Path A) with conversational capture as fallback (Path B), and parks unsure items in the same review queue.

### Added (2026-08-27, late)
- **`message` channel** for DM/text-thread touchpoints, plus a messaging-capture registry (`references/messaging-capture.md`): paste-based capture from any app (WhatsApp, Telegram, Signal, iMessage/SMS, LinkedIn, Slack, …) with per-app format notes, and a capability-based connector tier for tools that can read conversations directly.
- **CRM capability tiers and adapter registry** (`references/crm-sync.md`): Tier R (read — tracked-check + note import; HubSpot's official connector qualifies) vs Tier W (read/write — full sync), a six-slot tool-mapping format, and a 10-minute "Add your CRM" promotion protocol so anyone can bring their CRM.
- **docs/why-fulcra.md**: what the skills use Fulcra for, the value, and the honestly drawn necessary-vs-convenient line (README links it).
- **README chooser** ("which skill do I install?"), from the first live cross-harness install review.
- **docs/mcp-operations.md**: the complete MCP conformance list (the skills' regression surface) and **docs/harness-matrix.md**: dated per-harness install evidence.
- **Messaging browser-observation tier** (scheduled, read-only, user's own browser — LinkedIn DMs/WhatsApp Web) and the **scheduled sweep** Tend behavior (one-yes digest at schedule); both labeled designed/untested until testing.md rows exist.
- **CRM slot 6 (note placement)**: notes may also associate to existing deal/company objects where the CRM supports it — designed, untested; never creates or edits objects.
- **ADR-0007**: fulcra-raise-memory is a deliberate sibling product fork (founders-raising ICP, `/raise/` namespace); contracts diverge intentionally, engine fixes cherry-picked.

### Added (2026-08-28, review round 5)
- **Commit ledger**: every one-yes commit (snapshot or direct backfill) is preceded by an itemized ledger — person/date/source/gist, Will save vs Parked — making ADR-0005's consent literal.
- **Sweep watermarks**: per-source cursors in `handoff.md` with advance-on-resolution and failure-safe rules, so scheduled sweeps never rediscover the same messages.
- **Three-part sample cleanup**: the demo's cleanup soft-deletes the sample file, updates INDEX, and tombstones the sample key so sample data can never surface in reports.
- Per-destination veto disclosure (incl. the exact manual CRM deletion step); `get_user_info` in both preflights; delete-capability slot 7 in the CRM registry; "excluded from every read" scoped to these skills everywhere, with third-party readers told to apply the veto list.

### Fixed (2026-08-28, review rounds 6–7)
- **Stable-key precedence**: the date-form dedupe key applies only when no per-source key (calendar event id, transcript id, CRM note id, thread id) does — a stable source key is never replaced by the date form.
- **Interruption-safe sample cleanup**: the demo's cleanup order is now tombstone first, then soft-delete, then the plain-words summary — an interruption can no longer leave sample data live with no tombstone.
- **Snapshot loads the veto set before presenting** (single veto invariant made explicit at the snapshot surface, not just at reads and commits).
- `delete_file` added to both skills' connector preflights (cleanup and rule-2 veto need it).
- **Sync-vs-import honesty**: crm-sync principle 1 and the README now state that CRM-note *import* (slots 2–3) is a separate consented read path — selection, never mirroring — not a reverse sync.
- First live sweep run recorded (see testing.md 2026-08-28): first-run window rule, park-once, circularity guard, cross-key duplicate detection, zero-commit resolution, failure-safe watermark write.

### Fixed (2026-08-28, review round 8)
- **Privacy copy corrected**: the README now discloses that the snapshot reads recent transcripts and CRM notes/meetings whenever those tools are connected — reads only, independent of whether CRM sync is ever accepted. The old wording implied CRM reads only happened after accepting sync.
- crm-sync dedupe principle now enumerates all five canonical key forms (date-form + ordinals, calendar event id, transcript id, CRM-note id, messaging-thread id) instead of the stale two.

### Added (2026-09-10)
- Browser-observation **account-risk posture** (engine-level, adapted from the sales sibling): inbox-only, two windows a day, read only what is new, the user's own browser profile only, stop-on-first-warning with backoff, no decoy activity, honest ToS disclosure.

### Added (2026-09-15)
- **Connecting Fulcra guide** (`references/connect-fulcra.md`): both setup paths — Claude's app (account → Customize → Connectors → verify) and agent harnesses via Fulcra's official `fulcra-get-started` / `fulcra-connect` skills — with the honest line that no skill can create the account or authorize the connector itself. Both preflights and the README install steps point to it; CI now requires the pointer in every skill.

### Added (2026-09-15, later)
- **Silent-failure rails** (engine-level, from a month of unattended production runs): an empty Fulcra calendar window is never read as a quiet day (check the other surface); `read_file`'s "No file found" can mask an expired token — `list_files` shows the real 401, retry once, and a dead Fulcra is a STOP with no CRM writes; Otter timestamps are Pacific (convert before matching to calendar); an empty recording means capture failed, not that the meeting didn't happen. Both skills' rails and the connect guide carry them; CI checks for the anchors.

### Added (2026-09-15, extension guide)
- **Extension guide** (`references/extending.md`): how to add a messaging surface (paste row, connector slots M1–M4, browser tier), a notetaker (transcript slots T1–T4 with the timezone/participants/empty-recording checks), a CRM (pointer to the 8-slot protocol), or a calendar surface (attendee emails + stable ids) — plus an honest per-surface table (WhatsApp, Telegram, Signal, iMessage/SMS, Messenger/Instagram, LinkedIn, Slack/Discord) and the contribution checklist. Messenger/Instagram paste row added; README and both registries point to it; CI checks the pointer.

### Fixed (2026-09-15, HubSpot)
- **HubSpot claim corrected** (dealflow #49): the official connector is now write-capable; crm-sync.md carries the slot table and title-less dedupe mechanics; live-tested in the sales sibling, untested under this flavor.

### Added (2026-09-15, coexistence)
- **Coexistence with other loggers** (ADR-0011 in the sales packet; engine-level): before any CRM note write, the contact's existing notes are scanned for the touchpoint's *source id* in any format (`[touch:…]`, `[otter:…]`, `Source:` lines, URLs), not just this packet's key — a hit from any other logger means skip, count as a duplicate, and name the note. Each packet stays complete on its own; two systems on one CRM never write the same conversation twice.

### Added (2026-09-15, engine port from the sales sibling)
Everything in this block was built and live-run in [fulcra-sales-memory](https://github.com/keng009/fulcra-sales-memory) (its v0.2.0) and is ported here at engine level per ADR-0007: designed, live-tested only in the sales sibling, untested under this flavor until [docs/testing.md](docs/testing.md) rows exist. No pipelines here — the sales `[<pipeline>]` suffixes and `email-pipeline:` mapping do not exist in this packet.
- **Unattended auto-log** ([ADR-0009](docs/adr/0009-unattended-auto-log.md), Tend rule 6): an opt-in `auto-log` line in `handoff.md`'s `## Preferences` is a standing, revocable yes; scheduled sweeps then commit only high-confidence items (real transcript summary or an external non-broker attendee email; one resolved person) and park the rest; evidence carries `, auto-log`; no tasks or open follow-ups in auto mode; CRM notes only under a separate `crm:` preference line, contacts never created; a `## Sweep log` receipt per run (30 kept, older to `sweep-log-archive.md`) and a digest after any commit or park; dead Fulcra is a STOP. Brokered founder intros take identity from the non-broker attendee email and purpose from the transcript, never the broker's blurb (now also in the snapshot rules and the contract). ADR-0008 is deliberately unused here (the sales sibling's gated contact creation is not adopted), so engine ADR numbers stay aligned.
- **Email as a sweep source** ([ADR-0010](docs/adr/0010-email-as-a-source.md), opt-in, read-only): add `email` to the `auto-log` line and the sweep reads the mailbox by capability (Gmail: search threads, read thread), logs real conversations with an external counterparty as `email` touchpoints keyed `touch:gmail-thread:<id>`, surfaces deck-submission forms, data-room invites and other notifications as **signals** in the digest without logging them, and never sends, replies, or labels. Mail-tool slots E1–E3 in `extending.md`; README privacy section discloses it; CI anchors.
- **The skill builds the schedule** (Tend rule 7 + [`references/scheduling.md`](skills/dealflow-memory/references/scheduling.md)): "make this automatic" detects a scheduling capability (Claude's desktop app, Claude Code; claude.ai chat has none — the skill says so and falls back to "say sweep"), proposes name/cadence/what-each-run-does on a ledger, creates a single `dealflow-memory-sweep` task from a self-contained prompt template (load the skill or STOP; dead-Fulcra stop; plain-words digest), reads it back, and explains the app-open caveat. "stop my sweeps" disables it.
- **Made for non-technical investors**: a one-page [quick reference](docs/quick-reference.md) ("say this → get that", setup in three clicks, make-it-automatic, what it never does, what to do if something looks off) linked from the top of the README and handed over by the demo's outro; first-class daily-rhythm phrases — "prep my day" (today's founder meetings with what you owe each person), "what do I owe people", "sweep", "show me the review queue", "auto-log my calls" / "stop auto-logging", "make this automatic" / "stop my sweeps"; and a **plain-words rail** in both skills — no dedupe keys, typed records, tombstones, namespaces, watermarks, or MCP in conversation, ever. CI checks the rail and the phrases.
- `handoff.md` template gains `## Preferences` and `## Sweep log` in both skills; CONTEXT.md gains Auto-log, Sweep log, and Email touchpoint.

### Changed
- **Breaking (key scheme)**: calendar-derived commit keys are now the source event's stable id — `touch:cal:<event-id>` — instead of person+date ordinals, so re-runs and same-day re-orderings cannot shift keys. Data written under the date-form scheme stays valid: commits cross-scan both key forms and confirm on any match.
- Declined calendar events are skipped unless another source (transcript, CRM note) shows the meeting happened — sources beat RSVP status.
- Reversibility language made precise everywhere: files are versioned and soft-deletable; vetoed records are excluded from reads but remain stored.
- Connector suggestions moved to after the session's first delivered value.
- Install path updated to Claude's current flow: Customize → Skills → + Create skill → Upload a skill.

## [0.2.0] — 2026-08-26 — deal-flow repositioning

### Changed
- Repositioned as a deal-flow management tool: founder-first copy, `firm` → `company` across the contract (v2.1), Report regrouped as Companies seen / Active / Open follow-ups / Founders going quiet.
- Optional `stage_noted` observation — narrative only, never CRM pipeline state (ADR-0004).
- Same-day touchpoints get ordinal keys (`-2`, `-3`); dual writes are self-healing per destination (ADR-0003).

## [0.1.0] — 2026-08-26 — first public release

### Added
- The two skills (`dealflow-demo`, `dealflow-memory`), the shared data contract, optional one-way CRM sync (tested: Attio), untrusted-content and no-credentials rails, CI validation, release packaging, and the live-test matrix.
