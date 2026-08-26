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

## Contract v2 delta (2026-08-21) — not yet separately live-tested

The 2026-08-21 contract revision added the `dedupe_key` payload field, same-day ordinal keys, and per-destination reconciliation. The underlying mechanisms (JSON-in-note payloads, title scans) are identical to what passed above; the new fields and flows have **not yet** been re-run live. Next live pass should cover: a same-day second touchpoint (ordinal assignment), a simulated file-success/record-failure retry (self-healing fill), and an ambiguous CRM contact match (skip-and-say-so).

## Untested surfaces (labeled accordingly in-product)

HubSpot (official connector is read-only — sync requires a write-capable MCP server, untested), Notion (official connector read/write, block-append scope untested), Affinity (official connector read/write, untested). See issues #4 and #5.
