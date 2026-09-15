# Connecting Fulcra — before this skill can run

Both skills in this packet read and write the user's own Fulcra account. No skill can create that account, add the connector, or authorize it — those are the user's clicks. What a skill CAN do is guide each step, stay honest about which step is missing, and verify the connection the moment it exists. This file is that guide. The `dealflow-memory` and `dealflow-demo` preflights point here whenever the Fulcra tools are absent.

## Path A — Claude's app or any chat product with connectors (most users)

1. **Account.** Create a Fulcra account at [fulcra.ai](https://fulcra.ai). An empty account is fine — the demo works with no prior data, and nothing is required beyond the account itself.
2. **Connector.** In Claude: **Customize → Connectors → add Fulcra**, then complete the sign-in it opens. Other chat products that accept an MCP URL use `https://mcp.fulcradynamics.com/mcp`.
3. **Verify.** Start a new chat and ask: *"what's in my Fulcra data catalog?"* A catalog listing (even a near-empty one) means the connection works. Then install this packet's skill zip (**Customize → Skills → + Create skill → Upload a skill**) and say **"run the Fulcra dealflow demo"**.

If a session that used to work starts returning 401/unauthorized errors, the connector's authorization has lapsed: reconnect it under Customize → Connectors and retry. Two traps here are silent: `read_file` can report "No file found" when the real cause is the expired token (call `list_files` — it shows the true 401), and the file store also throws transient 401s/timeouts that recover on one immediate retry. Retry once; if `list_files` still fails, the token has expired and only reconnecting fixes it. The skills stop rather than fake success in that state — and never write to a CRM while Fulcra is down, because the veto set and watermarks live in Fulcra.

## Path B — agent harnesses (Claude Code, OpenClaw, Hermes, Codex, and similar)

Use Fulcra's official onboarding skills instead of repeating the steps by hand — they let the agent drive the whole connection:

- **`fulcra-get-started`** — connect first, then choose what to set up. Install with `npx skills add fulcradynamics/agent-skills` (or copy `skills/fulcra-get-started` into the agent's skills directory) and ask the agent to *"get started with Fulcra"*.
- **`fulcra-connect`** — the authentication flow it relies on: the `fulcra-api` CLI's device-code login (`fulcra auth login --get-auth-url`, then `--device-code`), or the MCP server at `https://mcp.fulcradynamics.com/mcp` where the CLI isn't available.

Source: [github.com/fulcradynamics/agent-skills](https://github.com/fulcradynamics/agent-skills). Once connected, install this packet's skill folder the same way and continue.

## What the preflight does with this

When `get_data_catalog`, `list_files`, `write_file`, `create_data_type`, `record_data`, or `get_records` are missing, the skill says which path applies, points here, and stops — it never describes what it *would* have done. When they are present, it proceeds without mentioning setup at all.
