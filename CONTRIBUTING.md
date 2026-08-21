# Contributing

Thanks for working on the dealflow packet. This file is the 60-second orientation plus the three rules that aren't obvious from the outside.

## The 60-second tour

- **Two skills, one contract.** `skills/dealflow-demo/` is the guided 10-minute session; `skills/dealflow-memory/` is the ongoing workflow. Both write the same `/dealflow/` layout in the user's Fulcra account, defined once in `skills/dealflow-memory/references/conventions.md` — the **data contract**. The demo embeds a minimal subset of it inline so it runs self-contained.
- **Vocabulary lives in [`CONTEXT.md`](CONTEXT.md).** Use its terms; don't drift to the synonyms it lists under _Avoid_.
- **Decisions with a "why on earth?" live in [`docs/adr/`](docs/adr/).** Read them before "fixing" something that looks odd — it may be deliberate (the git history and the note-title keys both are).
- **Agent tooling config** is in [`AGENTS.md`](AGENTS.md) and `docs/agents/` (issues live in GitHub Issues).
- These skills implement the patterns from [fulcra-for-agents](https://github.com/kubla/fulcra-for-agents): catalog inspection at bootstrap, repetition tolerance, derived context/provenance, durable handoff. Changes should stay recognizable as those patterns.

## The three rules that matter

1. **The contract is canonical, and embedded copies must not drift.** If you change a format (dedupe key, relationship-file template, payload schema, provenance suffix), change it in `conventions.md` *and* every place a skill embeds it — the demo's inline subset and the full skill's "Conventions summary" must stay byte-aligned with the contract. A drifted copy is a bug even if each file reads fine alone.

2. **Every README capability claim must map to something a skill demonstrably does.** No roadmap language presented as product, no "tested" without a real test, untested CRMs stay labeled "should work — tell us". This repo's audience includes people deciding whether to invest in Fulcra; over-claiming here costs more than anywhere else.

3. **Live platform features only.** Nothing may reference or depend on unshipped Fulcra features (at time of writing: Entries, file-system-updates, Groups). If the platform ships something new, a change may adopt it only once it's verified live.

## Testing a change

There's no build. The test is running the thing:

1. Zip the skill folder you changed (`skills/dealflow-demo` or `skills/dealflow-memory` — the latter's `references/` must be inside the zip).
2. Upload it as a custom skill in Claude, in an account with the Fulcra connector.
3. Run the affected flow against a real Fulcra account. For write paths, run it **twice** — the second run must produce zero duplicates (the dedupe scan is a hard requirement, not an optimization).
4. If you touched the README, re-check rule 2 against what you just observed.

## Workflow

PRs by convention, not enforcement: non-trivial changes (anything touching the contract, a skill's behavior, or a README claim) go through a PR so the other maintainer can sanity-check. Typo-grade fixes can push straight to `main`. Keep the internal spec/plan documents out of this repo — it ships product artifacts only.
