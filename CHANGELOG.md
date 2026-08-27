# Changelog

User-visible changes to the skill packet. Format follows [Keep a Changelog](https://keepachangelog.com/); versions are [release tags](https://github.com/keng009/fulcra-dealflow-memory/releases) with ready-to-upload zips attached. Live-behavior evidence for every claim: [docs/testing.md](docs/testing.md).

## [Unreleased] — v0.3.0, the snapshot-first flow (branch `flow/snapshot-first`, PR #28)

### Added
- **Snapshot**: read-only analysis of the last 30 days of deal flow (calendar on either surface — Fulcra or a Claude-side connector — plus transcripts and a read-only CRM check), shown before anything is stored. The snapshot performs zero writes.
- **Commit**: one collective yes converts the snapshot to stored memory (ADR-0005); ambiguous items are parked in `/dealflow/review-queue.md` with their evidence, never guessed; per-item review always available.
- **Veto tombstone**: typed records have no per-record delete, so a vetoed touchpoint's key goes on `handoff.md`'s `## Vetoed keys` list — every read (Recall, Report, Sourcing) excludes it and no commit re-imports it.
- **Sourcing check** ("seen this company before?") and **Tend** (deltas, vetoes, queue rulings, staleness at scale per ADR-0006).
- Demo runs snapshot-first (Path A) with conversational capture as fallback (Path B), and parks unsure items in the same review queue.

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
