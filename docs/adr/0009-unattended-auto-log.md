# Unattended auto-log: a standing, revocable yes per source

**Status: ACCEPTED (2026-09-15) — ported from the sales packet's [ADR-0009](https://github.com/keng009/fulcra-sales-memory/blob/main/docs/adr/0009-unattended-auto-log.md), where it was accepted and first live-run the same day. Implemented here as `dealflow-memory` Tend rule 6 and the contract's handoff rows. Designed, live-tested only in the sales sibling; untested under this flavor until the four testing.md scenarios below run.**

*Numbering note: this packet has no ADR-0008. The sales sibling's 0008 (gated CRM contact creation) is a product-level divergence this packet deliberately does not adopt — `dealflow-memory` never creates CRM contacts — so the number is left unused here to keep engine-level ADR numbers aligned across siblings (ADR-0007).*

## Context

Every write in this packet sits behind one explicit yes (ADR-0005): the snapshot commit, each capture, and the scheduled sweep's digest. That posture is right for a first-time user and for anything ambiguous. But the maintainer has run the same engine unattended for a month in a private setup — transcripts and calendar swept twice a day, notes written to the CRM with no per-run confirmation — and the value of that mode is the point of the product for an investor: founder conversations get logged whether or not they remember to ask. The ROADMAP has said since the snapshot-first flow that zero-touch auto-commit "stays out of scope until its own ADR". This is that ADR.

The private setup also produced the failure lessons now in the engine's rails (empty calendar results that are not quiet days, auth failures masked as missing files, Pacific transcript timestamps, empty recordings on brokered intros). Unattended mode is only safe *because* those rails exist; this ADR depends on them.

## Decision

Add an **opt-in unattended mode** to the scheduled sweep (Tend rule 5). It is a standing yes the user gives in advance, scoped and revocable, not a new consent-free path.

1. **Opt-in is explicit, per source, and lives in `handoff.md`:**
   ```
   ## Preferences
   - auto-log: transcripts, calendar
   ```
   No line → the sweep behaves exactly as today (digest, one yes). Removing the line revokes the standing yes; nothing else changes. (The sales sibling scopes the line per pipeline; this packet has no pipelines, so there is one line.)
2. **Eligibility is high-confidence only.** An item is auto-committed only when ALL hold: a transcript with a real summary exists, OR a calendar event with a non-broker external attendee email (OR, when `email` is opted in per ADR-0010, a real email conversation); and the counterparty resolves to exactly one person. Anything else — a no-summary recording, an attendee-less named meeting, a broker-only participant list, a counterparty who could be two people — **parks in the review queue exactly as today**. Auto mode never lowers the bar; it removes the wait.
3. **What an auto-commit writes**: the memory dual write (relationship entry + typed record), keyed by the stable per-source key, with `auto-log` appended to `evidence` (`otter transcript <id>, calendar <date>, auto-log`) so every auto-logged item is findable and vetoable. A CRM note is written too only when `## Preferences` carries a `- crm: <crm>` line — the standing CRM-sync yes for unattended runs, since there is no session in which to accept the per-session offer; contacts are never created (this packet's standing rail). **No tasks and no open follow-ups are created in auto mode** — follow-up signals stay in the summary and are listed in the digest; the user's acceptance of the digest is what turns them into tasks.
4. **A receipt per run, always.** `handoff.md` gains `## Sweep log`, one line per run: `- <ISO start> | sources: <list> | committed <n> | parked <n> | skipped-duplicate <n> | failed: <none|detail>`. The log keeps the last 30 lines; older lines roll into `/dealflow/sweep-log-archive.md`. A digest is posted after every run that committed or parked anything — **silent accumulation is forbidden**.
5. **Failure playbook, in priority order:** a dead Fulcra (expired token, persistent 401 — diagnosed via `list_files`, see the rails) is a **STOP**: no memory writes, no CRM writes, no watermark move, and the run reports itself as failed; an unreachable *gather* source (transcripts, calendar, mail) is skipped and named in the receipt, with the watermark for that source left unmoved; a failed CRM write leaves the memory write standing and retries on the next run, which the dedupe scan makes safe.
6. **The veto invariant is untouched.** Vetoed keys are never auto-re-imported; auto-logged items can be vetoed like any other; the veto set is loaded before every run.
7. **Brokered founder intros.** On intro-platform and scheduler meetings the founder's identity comes from the non-broker attendee email and the meeting's purpose from the transcript — never from the broker's blurb, which is routinely wrong about what the company does and why you met. A broker-only participant list is ineligible and parks.

## Alternatives considered

- **Keep one-yes only (status quo).** Safest; but the investor who forgets to open the chat gets nothing logged, which is the failure the product exists to prevent. Rejected as the *only* mode; it stays the default.
- **Auto-log everything, park nothing.** Rejected — the review queue is where the packet's honesty lives, and brokered intros show why: the broker's blurb is routinely wrong about purpose and company.
- **Auto-log to memory, never to the CRM.** Considered as a middle step. Rejected as a separate mode because CRM sync in unattended runs is already gated by its own `crm:` preference line and is dedupe-safe; users who want memory-only simply don't set it.

## Consequences

- ADR-0005 is amended, not replaced: consent moves from per-run to a standing, scoped, revocable line the user writes themselves (by saying "auto-log my calls"), with every run leaving a receipt and a digest.
- The sweep's watermark rules are unchanged; the receipt line is written in the same failure-safe order (after resolution, watermark last).
- Promotion requires testing.md rows under this flavor: an unattended run that commits eligible items, one that parks an ineligible brokered intro, one that hits a dead Fulcra and stops with no writes, and a revocation (line removed → next run digests instead of committing).
- ROADMAP's "out of scope until its own ADR" line points here.
- The calendar-only path (no transcript, but an external non-broker attendee email) IS eligible, per the sales sibling's ruling; the stricter transcript-required variant remains available as a one-word amendment if live rows show calendar-only auto-commits producing weak entries.
