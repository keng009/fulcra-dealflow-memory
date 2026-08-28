# fulcra-raise-memory is a deliberate product fork, not a shared library

This packet serves investors managing deal flow. Its sibling, [fulcra-raise-memory](https://github.com/keng009/fulcra-raise-memory), serves founders actively raising — a different ICP with a different vocabulary (investors and funds instead of founders and startups, "investors going cold" instead of "founders going quiet") and, over time, different features. The sibling was derived from this repo's engine (contract v3.1: snapshot-first flow, per-source dedupe keys, the veto invariant, review queue, CRM and messaging adapters) with a fresh public history, per the same reasoning as ADR-0001, and a disjoint Fulcra namespace (`/raise/`, `Raise Touchpoint`) so both products can run on one account.

**Decision**: the two repos diverge intentionally. There is no shared module, no cross-repo byte-alignment rule, and no obligation to keep contracts identical. Engine-level fixes (dedupe, veto, healing) get cherry-picked into the sibling by judgment when they apply; product-level features do not.

**Status**: accepted (2026-08-27, Nick).

**Consequences**: byte-alignment (CONTRIBUTING rule 1) remains strictly INTRA-repo; a fix to this repo's engine is not complete until someone has judged whether the sibling needs it (a checkbox in the fixing PR is enough); the sibling's claims stand on its own testing.md — this repo's live tests are evidence for its engine's design, never for the sibling's behavior.
