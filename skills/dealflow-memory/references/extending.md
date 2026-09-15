# Extending the packet — add a messaging app, a notetaker, a CRM, or a calendar

Everything in this packet detects tools **by capability, never by name**, so most additions need no change to the skill at all — they need a registry entry and a test row so the next user knows what to expect. This file is the one place that says how, for each kind of source. Two rules bind every addition: **reads never write** (no sends, replies, reactions, or "seen" marks on any platform), and **no claim without a `docs/testing.md` row** (CONTRIBUTING rule 2 — "designed-for, untested" is an honest label, not a failure).

## 1. Messaging surfaces (WhatsApp, Telegram, Signal, iMessage/SMS, Messenger, Instagram, LinkedIn, Slack, Discord, …)

Three tiers, cheapest first (details in `messaging-capture.md`):

**Paste tier — works for every app today, ~5 minutes to register.** The user pastes a thread; the skill logs one touchpoint per thread per day with channel `message` and evidence `pasted <app> thread`. To add an app: (1) add a row to the per-app table in `messaging-capture.md` — what a paste or export looks like, where timestamps are, one quirk worth knowing; (2) paste one real thread and log it — check the date came from the thread, the evidence names the app, and a second paste of the same thread is caught by the date-form key; (3) add a sanitized row to `docs/testing.md`.

**Connector tier — when a tool can read conversations.** Map the tool onto four slots: **M1** list conversations or threads; **M2** read a thread (sender + timestamp per message); **M3** a stable thread or message id — this is what earns the per-source key `touch:<tool>-thread:<id>` instead of the date form; **M4** (optional) search. M1–M2 make it a source; without M3 it still works on date-form keys. Test: capture one thread through the connector (evidence `<tool> thread <id>`), capture it again and confirm the skip, then record the row. Never map a slot that sends.

**Browser-observation tier** — for apps with no API and no connector, read-only in the user's own browser on their schedule; the account-risk posture in `messaging-capture.md` applies unchanged. Adding an app here means adding its inbox-only read pattern, nothing more.

Where each surface honestly stands today:

| Surface | Today | Path to more |
|---|---|---|
| WhatsApp | Paste (chat export `.txt` or screen copy); WhatsApp Web via browser observation | A connector with M1–M3 would qualify; none official |
| Telegram | Paste (Desktop JSON export or screen copy). Bot tokens cannot read a person's own DMs | A user-session reader with M1–M3; say "untested" until a row exists |
| Signal | Paste (screen copy — Signal Desktop has no chat export) | No API by design; paste is the honest ceiling |
| iMessage / SMS | Paste; community MCP servers read the macOS Messages database (no official connector) | Connector tier once one is connected and tested |
| Facebook Messenger / Instagram DMs | Paste ("Download your information" export, or screen copy) | No read connector; paste |
| LinkedIn DMs | Paste (screen copy) or browser observation | No API for DMs; browser tier is the ceiling |
| Slack / Discord | Paste, or the connector tier where a connector can read DMs (Slack's official connector can) | Connector tier — test and record |

## 2. Notetakers and transcript tools (Otter, Zoom, Fireflies, Fathom, Granola, Read.ai, …)

Source Level 3 is any tool that fills these slots: **T1** list transcripts in a date window (id, title, start time, participants); **T2** fetch the summary and action items; **T3** fetch the full transcript; **T4** a stable transcript id → key `touch:<transcript-id>` (the tool's own id; when two tools are connected, the evidence line names the tool so the ids stay attributable). T1 + T4 make it a snapshot source; T2 makes it a capture source; T3 is for quotes and deeper distillation.

Three checks before trusting a new tool, learned the hard way: **timezone** — verify one transcript's start time against its calendar event before matching anything (Otter reports Pacific regardless of the user's zone); **participants** — scheduler-brokered calls often list only the broker, so identity comes from the calendar attendee email; **empty recordings** — a transcript with no content means capture failed, not that the meeting didn't happen. Test: log one meeting from the tool, log it again and confirm the skip, record the row, and add the tool to the Level 3 examples in the skill with its timezone behavior noted.

## 3. CRMs

Already fully specified: the eight capability slots, note format, per-CRM quirks, and the 10-minute promotion protocol live in `crm-sync.md`; connector paths and the lean structure recipe per CRM live in the sales sibling's `crm-setup` skill (`references/connect-crm.md` in keng009/fulcra-sales-memory). Add a CRM by filling the slots, running the write / dedupe / import tests, recording the rows, and PR-ing the registry section — exactly as that file says.

## 4. Calendars

Calendar is read from either surface by capability. A new surface qualifies when it returns events with **attendee emails** (identity) and a **stable event id** across fetches (the `touch:cal:<event-id>` key). Test the id twice, an hour apart, before claiming stability — that is the row that promoted Google Calendar. Remember the rail: an empty window from one surface is never a quiet day.

## 5. The contribution itself

1. Registry entry: a table row (messaging, calendar) or a section (CRM, notetaker) in the matching reference file.
2. A dated, sanitized `docs/testing.md` row — no real names, "a contact in a test workspace".
3. A `CHANGELOG.md` line.
4. A PR; CI validates links and rails, and a maintainer checks each claim against a demonstrated behavior.

What an extension never does: add a new dedupe-key form (that is a contract change in `conventions.md`, with its own PR), send anything on any platform, or promote a tool without a row. A failed test is still a contribution — file an issue with the step, the tool called, and what came back.
