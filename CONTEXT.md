# Dealflow Memory

The domain language of this skill packet: two Claude skills that turn an investor's own Fulcra account into deal-flow relationship memory. This glossary is the canonical vocabulary; `skills/dealflow-memory/references/conventions.md` holds the data formats behind it.

## Language

### The interactions

**Touchpoint**:
A real-world interaction between the user and a person in their deal flow — a call, meeting, email exchange, event conversation, or similar. The event itself, not any stored copy of it.
_Avoid_: interaction, meeting note, log entry (for the event)

**Representation**:
A stored projection of one touchpoint. A touchpoint has up to three: a relationship-file **entry**, a **typed record**, and (when CRM sync is on) a CRM **note**. One event, up to three projections, all carrying the same dedupe key.

**Entry**:
The narrative representation of a touchpoint: a dated block inside a relationship file, newest first.

**Typed record**:
The structured representation of a touchpoint: one Dealflow Touchpoint record, queryable by date, powering reports and stale alerts.
_Avoid_: structured record, annotation

**Dealflow Touchpoint**:
The custom Fulcra data type (proper noun) whose records are the typed records.

**Channel**:
How a touchpoint happened. Exactly one of: call, meeting, email, event, other.

### The people

**Relationship**:
The user's ongoing connection to one person — always person-level. Firm-level views ("what do I know about Acme Ventures") are always derived by aggregating that firm's people; there are no firm-level relationship files.
_Avoid_: contact (that's the CRM's word), account

**Relationship file**:
The one narrative file per person under `/dealflow/relationships/<slug>.md`: who they are, open follow-ups, and their touchpoint entries.

**Person slug**:
The lowercase, hyphenated identifier derived from a person's name (`jane-doe`), disambiguated by firm only on collision.

**Sample touchpoint**:
The clearly-labeled fictional touchpoint (Jane Doe, Acme Ventures) the demo offers when the user has nothing real to log. Never presented as real data.

### The machinery

**Dedupe key**:
The deterministic identifier every touchpoint gets (`touch:<person-slug>:<YYYY-MM-DD>`, or the transcript id). Scanned for before every write, in every representation; finding it means skip. The mechanism behind "re-running can't duplicate data."

**Provenance suffix**:
The trailer every representation carries: producer | evidence | recorded-at. Marks stored conclusions as derived, never as source observations.

**Dual write**:
Writing a captured touchpoint as both its entry and its typed record in one pass.

**Bootstrap**:
What either skill does at the start of a fresh session: inspect the Fulcra data catalog and the `/dealflow/` folder, detect connected sources, and state what it found before acting.

**Capture / Recall / Report**:
The full skill's three behaviors: log a touchpoint; brief the user on a person ("prep me for X"); summarize a period ("what moved this week"), including the going-quiet list.

**Going quiet**:
The state of a relationship whose latest touchpoint is 45+ days old; surfaced by Report.
_Avoid_: stale (in user-facing output; fine internally)

**Source level**:
How much automation the full skill detected: Level 1 (Fulcra only, conversational capture), Level 2 (+ calendar), Level 3 (+ transcript tool). Detected at bootstrap, never required.

**CRM sync**:
The optional, detected, one-way copy of touchpoints into the user's CRM as notes on matched contacts. Orthogonal to source levels; never creates contacts, never touches fields or stages.

### The packet

**The demo**:
The `dealflow-demo` skill: one guided session, about ten minutes, ending with a prep brief from what it just stored.
_Avoid_: lite, the lite version

**The full skill**:
The `dealflow-memory` skill: the ongoing capture/recall/report workflow.

**Data contract**:
`skills/dealflow-memory/references/conventions.md` — the canonical formats both skills conform to. Where this glossary defines what a word means, the contract defines the bytes.
