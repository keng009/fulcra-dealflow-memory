# Required MCP operations — conformance list

The skills are MCP-only: every platform operation they perform goes through the Fulcra MCP server (no CLI, no REST calls of their own). This is the complete list, so any harness, platform test suite, or reviewer can verify support without reverse-engineering the prose. If an operation here stops working on the MCP server, a skill behavior breaks — this list is the regression surface.

## Fulcra MCP server — required

| Tool | Used by | Behaviors | Access |
|---|---|---|---|
| `get_data_catalog` | both | Bootstrap; demo catalog moment; create-if-absent check | read |
| `get_user_info` | both | Timezone for every timestamp | read |
| `list_files` | both | Folder discovery; dedupe scans | read |
| `read_file` | both | Relationship files, INDEX, handoff (veto set), review queue | read |
| `write_file` | both | Every narrative write (versioned) | write |
| `create_data_type` | both | `Dealflow Touchpoint` create-if-absent | write |
| `record_data` | both | Every typed-record write | write |
| `get_records` | both | Dedupe scans; Recall; Report; Sourcing check | read |
| `delete_file` | demo (sample cleanup); full (only when a veto empties a single-touchpoint file) | Soft delete only | write |

## Fulcra MCP server — used when present, never required

| Tool | Used by | Behaviors |
|---|---|---|
| `get_calendar_events` | both | Snapshot sweep and corroboration when the account holds calendar data (Level 2, Fulcra surface) |

## Non-Fulcra tools — detected by capability, never required

| Capability | Behaviors |
|---|---|
| Claude-side (or harness-side) calendar connector | The other half of dual-surface calendar detection |
| Transcript tool (list + fetch) | Level 3 capture and snapshot enrichment |
| CRM tools per the capability slots in [`crm-sync.md`](../skills/dealflow-memory/references/crm-sync.md) | Tier R reads; Tier W sync |
| Conversation-reading messaging tools | Connector tier in [`messaging-capture.md`](../skills/dealflow-memory/references/messaging-capture.md) |

## Platform behaviors the skills depend on

- Files are **versioned** on write and deletes are **soft** (the reversibility posture leans on this — ADR-0005).
- Typed records have **no per-record delete** (the veto tombstone exists because of this).
- Reads may briefly lag writes (both skills carry the lag guard: report success from the write result, retry one read).

Conformance check: exercise each required tool once against a live server (the dated runs in [`testing.md`](testing.md) each did this implicitly; a committed scripted suite would make it explicit — none exists in this repo yet).
