# The memory is a working set, never a CRM mirror

A VC's CRM can hold tens of thousands of auto-ingested contacts; a partner actively works perhaps 50–200 relationships. This memory deliberately holds only relationships with actual touchpoints — the narrative working set — and never imports the contact graph. Breadth questions ("is Acme anywhere in my world?") delegate to the CRM's own server-side search via the read-only gap check; depth questions (what happened, what you judged, what's going quiet) are the memory's job. Backfill is therefore activity-bounded (recent touchpoint activity), never CRM-bounded (the contact base). Consequent access patterns are part of this decision: recall reads relationship files first and uses typed records only over bounded time windows; staleness is computed from the index minus a windowed activity query, not per-file sweeps.

**Status**: accepted (2026-08-26, Nick).

**Consequences**: the memory stays small enough that its access patterns hold at any CRM size; "why isn't my whole CRM in here?" is answered by design, in the README; a future bulk-import feature would be a deliberate reversal of this decision, not an extension.
