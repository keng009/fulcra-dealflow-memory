# Idempotency keys live in note titles, not structured fields

Every touchpoint's dedupe key (`touch:<person-slug>:<date>`) is carried as a plain-text suffix in the CRM note **title** (and in relationship-file entry headings), and the before-write check is a title scan. We'd have preferred a structured field, but Attio — the tested CRM — supports no custom fields on notes at all, and a title-borne key generalizes to any CRM whose note primitive the connector can write and read back (with a first-body-line fallback for title-less primitives). One mechanism everywhere beats a per-CRM schema feature we can't rely on existing.

**Status**: accepted.

**Consequences**: keys are human-visible in note titles (cosmetic cost, accepted); the dedupe guarantee depends on the exact key string surviving in a readable field, so nothing may rewrite or truncate note titles; once users' CRMs contain keyed notes, changing the key format requires a migration story, not an edit.
