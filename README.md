# Fulcra Dealflow Memory

Two Claude skills that turn your own [Fulcra](https://fulcra.ai) account into deal-flow relationship memory. Fulcra is a personal context platform: your account holds your data — calendars, health, location, files, custom records — and any AI assistant you connect to it over MCP reads and writes that same account. These skills use it as memory for your deal flow. Every conversation with a founder, fund partner, LP, or co-investor is stored twice: a narrative file you can read, and a typed record software can query. From there you get meeting prep ("prep me for Jane"), weekly review ("what moved this week"), a going-quiet list of relationships with no touchpoint in 45+ days, and an optional one-way copy into your CRM. Because the memory lives in your account rather than inside any one chat product, it persists across sessions and across assistants.

## See it in 10 minutes — `dealflow-demo`

One guided session. The skill inspects your Fulcra data catalog, captures one real touchpoint from your world, writes it into your account in both forms, and generates a prep brief from what it just stored.

1. Create a Fulcra account at [fulcra.ai](https://fulcra.ai) if you don't have one. An empty account is fine — the demo works without prior data.
2. In Claude, open **Settings → Connectors** and connect **Fulcra**.
3. Download this repo, zip the `skills/dealflow-demo` folder, and upload the zip as a skill in Claude under **Settings → Capabilities → Skills**.
4. Start a new chat and say: **"run the Fulcra dealflow demo"**.

## Make it your workflow — `dealflow-memory`

The ongoing version: log conversations as they happen, prep before meetings, review the week, catch relationships going quiet.

1. Same Fulcra account and connector as above.
2. Zip the `skills/dealflow-memory` folder — its `references/` subfolder must be inside the zip — and upload it the same way.
3. Say **"log my call with Jane"**, **"prep me for tomorrow"**, **"what moved this week"**, or **"who have I gone quiet on"**.

Only the Fulcra connector is required. If your Fulcra account has calendar data, the skill detects it and uses it: touchpoints get corroborated against real meetings, and "prep me for tomorrow" reads the actual calendar. If a transcript tool (Otter, Zoom, Fireflies) is connected, it can log meetings straight from transcripts. Nothing to configure — each session it states what it found and what connecting more would add.

Both skills write the same formats to the same `/dealflow/` folder in your account, so anything you logged during the demo is picked up by the full skill as-is. No migration.

## The first three exchanges

Illustrative — the catalog lines reflect whatever your account actually holds, and if you have nothing to log, the demo offers a clearly labeled sample touchpoint instead.

> **You:** run the Fulcra dealflow demo
>
> **Claude:** Fulcra is connected. Your account already holds sleep data, heart rate, two calendars, and location history — that's what this demo writes into: your account, not ours. Tell me about a recent conversation with a founder, LP, or co-investor. Who was it with, and what firm?
>
> **You:** Call yesterday with Jane Doe, a GP at Acme Ventures. We talked through a possible seed co-invest and she offered to share their diligence checklist. I owe her our deck.
>
> **Claude:** Recap: Jane Doe (Acme Ventures), call, yesterday — seed co-invest, diligence checklist offered, you owe her the deck. Good to store?
>
> **You:** Yes.
>
> **Claude:** Written: `/dealflow/relationships/jane-doe.md`, newest touchpoint on top. Created: `/dealflow/README.md` and `INDEX.md` — first run only. Created: a **Dealflow Touchpoint** data type in your account — it didn't exist a minute ago. Recorded: one typed touchpoint against it. The same fact now exists twice — prose you can read, and a structured record other software can query. Reading it back for your prep brief…

The brief that follows is generated from the stored data, not from the conversation: the skill reads the file back and checks that the record round-trips before it summarizes.

## Already have a CRM?

Keep it. If your Claude has CRM tools connected, `dealflow-memory` offers — once per session, never requires — to copy each logged touchpoint into the CRM as a note on the matched contact, with follow-ups as tasks where the CRM supports them. The sync is one-way, Fulcra → CRM, notes and tasks only: it never creates contacts and never edits fields, stages, or amounts, so your CRM stays the system of record for pipeline. Logging the same touchpoint twice can't duplicate notes — every note title ends with a deterministic key, and the skill scans the contact's existing note titles before writing. Tested with Attio. HubSpot and Notion have official connectors that expose the same shape (contact search plus note creation) and should work; Affinity has no official connector yet, but the same design applies if you connect an Affinity MCP server. If you try one, tell us by opening an issue. No CRM connected? The skill never mentions one.

## What this demonstrates

Each row is behavior you can watch one of the two skills perform, mapped to the Fulcra capability it runs on.

| What the skill does | Fulcra capability |
|---|---|
| Opens by naming data your account already holds — sleep, calendars, existing custom types — before writing anything | Data catalog (`get_data_catalog`): agents inspect what an account contains instead of assuming |
| Keeps one narrative file per person under `/dealflow/relationships/`; updating a file creates a new version rather than destroying the old one, and deletes are soft | Versioned file store (`list_files`, `read_file`, `write_file`) |
| Creates a `Dealflow Touchpoint` data type live in your account, then logs one typed record per touchpoint — the records the "what moved this week" report queries | Custom data types with structured payloads (`create_data_type`, `record_data`, `get_records`) |
| Ends the demo by pointing you at the same data in your Fulcra portal and suggesting you ask another connected assistant — ChatGPT, say — "what do you know about Jane?" | Cross-assistant memory: every assistant connected to the account over MCP reads the same files and records |
| Scans for a deterministic dedupe key before every write — relationship file and CRM alike — and stamps every touchpoint entry and typed record with a provenance suffix (producer, evidence, timestamp) | The agent patterns explored in [fulcra-for-agents](https://github.com/kubla/fulcra-for-agents): repetition tolerance, derived context |

The data contract behind all of it — file formats, dedupe keys, the record schema, the provenance rule — is written once, in [`skills/dealflow-memory/references/conventions.md`](skills/dealflow-memory/references/conventions.md). Both skills conform to it.

## Privacy

These skills are instruction files. They run in your Claude, against your Fulcra account: there is no server, no telemetry, and no analytics, and nothing they do reports back to Fulcra-the-company or to the authors. Everything they write lands in your own account under a single `/dealflow/` folder — they never write anywhere else in it — plus, only if you accept the offer, notes in your own CRM. Outside that folder they only read, and only what the features need: your data-catalog listing (to show you what your account holds), your calendar if connected (to corroborate touchpoints and prep tomorrow), and your timezone. If you accept CRM sync, they also search your CRM's contacts and read existing note titles to dedupe; if you log from a transcript tool, they read the transcripts you pick. They never write credentials, tokens, or secrets to any file, and they never send email or messages on your behalf: ask for a follow-up and you get a clearly labeled draft. File deletes in Fulcra are soft, so removing the demo's sample file is reversible; the sample typed record has no per-record delete through the connector and simply sits inert, clearly labeled as sample data.

---

MIT — see [LICENSE](LICENSE). Maintained by Nick Kengmana, Fulcra.
