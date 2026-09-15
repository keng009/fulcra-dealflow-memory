# Dealflow Memory — the one-page version

You don't need to know what a connector, a record, or an MCP is. You talk to Claude the way you'd talk to an associate who remembers every founder you've ever spoken to. This page is the whole manual.

> This page describes the snapshot-first flow on the `flow/snapshot-first` branch ([PR #28](https://github.com/keng009/fulcra-dealflow-memory/pull/28)), which is what these skills do once you install them from that branch. The published release zips currently serve v0.2.0 — the previous flow — until v0.3.0 ships; until then, zip the skill folder from this branch yourself (the README's install steps show how).

## Set up once (10 minutes, three clicks' worth)

1. Make a free account at [fulcra.ai](https://fulcra.ai). It's where your memory lives — yours, not ours.
2. In Claude: **Customize → Connectors → add Fulcra**, then sign in.
3. Upload the skill: **Customize → Skills → + Create skill → Upload a skill**, pick `dealflow-memory.zip` from the [releases page](https://github.com/keng009/fulcra-dealflow-memory/releases/latest). (Use a release zip rather than zipping the folder yourself where you can — on Windows, home-made zips can be rejected for their internal path format; if you must zip the folder from this branch, do it from a Mac/Linux shell or with a zip tool that writes forward-slash paths.) Then open a new chat and say **"show me my last 30 days"**. (If Skills isn't visible in Claude, turn it on under Settings → Capabilities first.)

Optional, later: connect your calendar and your meeting recorder (Otter, Zoom, Fireflies) in Connectors too. The more you connect, the less you type.

## Every day — say this, get that

| You say | What happens |
|---|---|
| **"prep my day"** | A short brief for each founder you're meeting today: who they are, what you last discussed, what you owe them, what to bring up. |
| **"log my call with Sam"** | Claude asks a couple of questions (or none, if it heard the meeting through your recorder), then saves the conversation to your memory. |
| **"log this"** + a pasted WhatsApp, LinkedIn, iMessage, or email thread | Same thing, from the thread. Any app, no setup. |
| **"prep me for Sam"** | Everything you know about Sam and their company, in five lines, before the call. |
| **"what do I owe people"** | Every open follow-up you've promised, oldest first. |
| **"what moved this week"** | Your week by company: who's new, who's active, where each deal stands (in your own words), who you owe. |
| **"who's going quiet"** | Founders you haven't touched in 45+ days. |
| **"have I seen Acme before?"** | Your history with a company or founder — or an honest "no, this is new to you." |
| **"that one's wrong"** | Removes a saved conversation from everything the skill shows you. |
| **"show me my last 30 days"** | The big picture from your calendar and recordings, shown *before* anything is saved — one yes saves it all. |

## Make it automatic

Say **"auto-log my calls"** once — from then on, every sweep logs your founder calls and meetings without asking and leaves you a short digest (add **"and my email"** to include real email conversations; deck-submission forms, data-room invites and the like are shown as signals, not logged) (undo any time with **"stop auto-logging"**). Then say **"make this automatic"** — where your Claude can schedule things (the desktop app can), Claude builds a weekday-afternoon sweep for you and reads it back; where it can't, it tells you, and you just say **"sweep"** whenever you open a chat. Same result either way; only the trigger differs. (Hands-off mode was built and live-run in the sales sibling packet; under this deal-flow flavor it is designed but not yet live-tested.)

## Your CRM (optional)

Don't have one? You don't need one — this *is* your record of every founder conversation. Have Attio, HubSpot, Notion, or Affinity? Connect it in Connectors, then say **"sync this to my CRM"** after logging a call. Notes go in as notes, follow-ups as tasks. It never edits your fields or stages and never adds contacts.

## What it will never do

Send a message or email for you (it drafts; you send). Change anything in your CRM except adding notes and tasks — and never add a contact. Save something without a yes — or, in hands-off mode, without leaving a receipt you can read. Store passwords or anything you paste that looks like one.

## If something looks off

- **"Fulcra isn't connected"** → Customize → Connectors, reconnect Fulcra, try again. That's almost always it.
- **It says "already logged"** → good; it caught a duplicate.
- **It parked something "for review"** → it wasn't sure who or what a meeting was. Say **"show me the review queue"** and rule on it in a sentence.
- **Anything else** → tell whoever gave you the skill. Early days; feedback is the point.
