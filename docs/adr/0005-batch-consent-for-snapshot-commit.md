# One collective yes commits the snapshot (batch consent)

The snapshot-first flow shows the investor a read-only analysis of their recent deal flow, then converts it into stored memory on a single "save this" confirmation — rather than confirming each touchpoint individually. This deliberately loosens the confirm-per-item posture, and it is honest for three reasons together: consent is explicit and informed (they just read exactly what will be saved), every write is dedupe-keyed and idempotent, and everything is reversible (versioned files, soft deletes, archivable records) with a full commit summary listed afterward. Per-item review remains available — it is simply never the gate. Ambiguous items are never covered by the batch yes: they go to the review queue, unwritten.

**Status**: accepted (2026-08-26, Nick).

**Consequences**: the reversibility guarantee becomes load-bearing (nothing in the commit path may use an irreversible write); the commit summary is mandatory output, not politeness; if a future storage target lacks soft deletion, batch consent does not extend to it.
