# Same-day touchpoints get ordinal keys; dual writes reconcile per destination

The original dedupe key (`touch:<person-slug>:<YYYY-MM-DD>`) made a second real conversation with the same person on the same day indistinguishable from a duplicate, and the file scan gated the file+record pair as a unit — so a partial write (file succeeded, record failed) was skipped forever on retry. We fixed both together: additional same-day touchpoints append the next unused ordinal (`-2`, `-3`), a matched key triggers a confirm-with-the-user rather than a silent skip, the typed-record payload now carries `dedupe_key` explicitly, and every capture checks each representation against its own store, writing only what's missing (self-healing). We chose ordinals over time-of-day in the key because users often don't know exact times, and a deterministic counter keeps keys stable across retellings.

**Status**: accepted (2026-08-21, while adoption ≈ 0 — the cheapest moment for a key-format change per ADR-0002's migration warning).

**Consequences**: keys are no longer derivable from person+date alone — scans must match the base key *and* its ordinals; the payload `dedupe_key` field is now load-bearing for record-side reconciliation; ADR-0002's title-scan mechanism is unchanged.
