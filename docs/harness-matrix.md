# Cross-harness install matrix

The skills are written to run on any agent harness that can load skill instructions and reach the Fulcra MCP server ([AGENTS.md](../AGENTS.md) exists for exactly this). Claims stay per-harness and evidence-backed: **reading the memory** from another assistant is proven (any MCP client reads the same files/records); **running the skills** on a harness needs a green row here. Update this table per attempt, dated.

| Harness | Install path | Last attempt | Result | Blockers / notes |
|---|---|---|---|---|
| Claude (claude.ai, custom skill upload) | zip → Customize → Skills → + Create skill → Upload a skill | 2026-08-27 (write paths; see [testing.md](testing.md)) | 🟡 Engine paths live-tested from Claude sessions; the full zip-upload demo session is [#31](https://github.com/keng009/fulcra-dealflow-memory/issues/31) | The primary target |
| Claude Code / Claude Cowork | skill folder in-session | 2026-08-26→28 (all live-test runs) | 🟢 Engine live-tested end to end | Development harness |
| Hermes | agent reads repo, self-installs | 2026-08-28 (live, during build session) | 🔴 Inconclusive | Agent found the repo, chose a skill, connected Fulcra; then a harness crash + a suspected Fulcra MCP-server bug (platform side, being reproduced upstream). Retry after the bug verdict |
| OpenClaw | agent reads repo | — | ⚪ Untried | |
| Codex | agent reads repo (AGENTS.md) | — | ⚪ Untried | Codex has run code review on this repo, not the skills |
| Grok | — | — | ⚪ Untried | |
| Gemini | — | — | ⚪ Not targeted | No Fulcra MCP path established |

Legend: 🟢 verified · 🟡 partially verified · 🔴 attempted, inconclusive/failed · ⚪ untried.
