# Deal stages are recorded as observations, never managed as pipeline state

Repositioning the packet as a deal-flow tool (2026-08-26) wanted stage awareness — "what moved" is only meaningful against stages — but this repo's standing promise is that the user's CRM remains the system of record for pipeline, and sync never touches CRM stages or fields. We resolved the tension by adding `stage_noted`: an optional, as-of-that-conversation observation captured only when the user volunteers it ("they're raising a seed", "we passed"), stored in the touchpoint's payload and as a `Stage noted:` narrative line. Reports may surface observations and changes between them, always labeled "per your notes". The skills never reconcile stages, never ask a dedicated stage question, and never write a stage anywhere in a CRM.

**Status**: accepted.

**Consequences**: stage data can be stale or contradictory across touchpoints — that's correct behavior for observations (the narrative reflects what was said when); anyone tempted to "fix" that by managing stage state is proposing to compete with the user's CRM, which this packet deliberately does not do. Renamed `firm` → `company` in the same contract revision (v2.1) — payload consumers must use `company`.
