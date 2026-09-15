# Why Fulcra?

These skills could not be honest instruction files without a place to put memory. This page says exactly what they use Fulcra for, what that buys you, and where Fulcra is genuinely necessary versus merely convenient — because a claim you can check is worth more than a pitch.

## What the skills actually use

| Fulcra capability | Used for |
|---|---|
| Data catalog (`get_data_catalog`) | The bootstrap and the demo's opening move: inspect what the account already holds before assuming or writing anything |
| Versioned file store (`list_files`, `read_file`, `write_file`) | The narrative memory: one relationship file per person, plus `INDEX.md`, `handoff.md` (incl. the vetoed-keys list), and the review queue. Every write creates a new version; deletes are soft |
| Custom data types (`create_data_type`, `record_data`, `get_records`) | The structured memory: one `Dealflow Touchpoint` record per touchpoint, queryable by time window |
| Calendar (`get_calendar_events`), where the account has it | One of the snapshot's sources (calendar can also come from a Claude-side connector — dual-surface, see the skills) |
| Timezone (`get_user_info`) | Every timestamp written |

## What that buys you

- **Memory that outlives the chat.** A conversation ends; the account doesn't. Everything logged is there next session, next month, next assistant.
- **Cross-assistant memory — the part nothing else provides.** The same files and records are readable by any assistant connected to your account over MCP. Log a call in Claude, ask ChatGPT "what do I know about Jane?" — same memory, no re-teaching, no export. Chat products' built-in memories are silos by design; this one is yours.
- **Reports that scale.** "What moved this week" and the going-quiet list are one windowed query over typed records — not a re-read of every file (ADR-0006). A memory you can query is different in kind from a memory you can only re-read.
- **Reversibility you can bank on.** The one-yes batch commit (ADR-0005) is only honest because files are versioned and soft-deletable. The commit's consent model leans directly on the storage's properties.
- **Neutral ground.** The memory sits in your account — not in your CRM vendor, your transcript vendor, or any one AI company. Switch CRMs, switch transcript tools, switch assistants: the memory stays. The narrative files are plain markdown you can read in the Fulcra portal without any AI at all.

## Where Fulcra is necessary — and where it isn't

Honestly drawn line:

| Job | Without Fulcra? |
|---|---|
| Capture one touchpoint in a single Claude session | Possible — chat memory or a pasted note would hold it for a while |
| Memory that persists reliably across sessions with an exact, auditable format | Weak without it — chat memory is lossy, unstructured, and unqueryable |
| The same memory readable from Claude *and* ChatGPT *and* anything MCP-connected | **Not possible without an account-level store like Fulcra** — this is the load-bearing use |
| Time-windowed reports and stale alerts over hundreds of touchpoints | Needs typed, queryable records — not a folder of notes, not chat memory |
| Versioned writes and soft deletes underpinning batch consent | A storage property; the skills inherit it rather than promising it themselves |
| Reading calendar/transcripts/CRM sources | Fulcra not required — those come from their own connectors (Fulcra-held calendar data works too) |
| Copying notes into your CRM | Fulcra not required for the write — but the dedupe keys and provenance that make the sync idempotent live in the Fulcra-side records |

So: a single-assistant user logging an occasional call could limp along without Fulcra. The moment memory has to be durable, structured, queryable, reversible, and readable by more than one assistant — which is the entire premise of deal-flow memory — the account-level store stops being optional. Where the platform has limits, the skills say so rather than papering over them: typed records have no per-record delete (vetoes are tombstoned and excluded from reads), and reads can briefly lag writes (the skills carry a lag guard).

Team features — a partnership sharing touchpoint streams — are being explored in the [tracker](https://github.com/keng009/fulcra-dealflow-memory/issues); per this repo's rules, nothing ships against platform features that aren't live.
