# Roadmap

Where this packet is headed, by theme. The [issue tracker](https://github.com/keng009/fulcra-dealflow-memory/issues) is the source of record — this page is the map, and items link to their issues where one exists. Nothing here is a promise with a date; items gated on platform capabilities ship only when those are live (CONTRIBUTING rule 3).

## Now — prove it and release v0.3.0

The snapshot-first flow (Show → Save → Tend) is built and its write paths are live-tested with dated evidence ([testing matrix](docs/testing.md)). Remaining gates: the release-ZIP investor journey run end to end ([#31](https://github.com/keng009/fulcra-dealflow-memory/issues/31)) and the Fulcra review pass ([#1](https://github.com/keng009/fulcra-dealflow-memory/issues/1)). Then [PR #28](https://github.com/keng009/fulcra-dealflow-memory/pull/28) merges and v0.3.0 tags ([#26](https://github.com/keng009/fulcra-dealflow-memory/issues/26)).

## Adapters everywhere — bring your own tools

The contract now qualifies tools by capability, not by name, with community promotion protocols:

- **CRMs**: capability tiers (Tier R read / Tier W sync) + the 10-minute "Add your CRM" protocol in [crm-sync.md](skills/dealflow-memory/references/crm-sync.md). Next candidates: Affinity ([#36](https://github.com/keng009/fulcra-dealflow-memory/issues/36)), HubSpot Tier W ([#4](https://github.com/keng009/fulcra-dealflow-memory/issues/4)), Notion ([#5](https://github.com/keng009/fulcra-dealflow-memory/issues/5)).
- **Messaging**: the `message` channel + [messaging-capture.md](skills/dealflow-memory/references/messaging-capture.md) — paste tier for any app, connector tier for tools that can read conversations. Live-test pass: [#37](https://github.com/keng009/fulcra-dealflow-memory/issues/37).
- **Richer CRM targets**: notes associating to deals/companies/tickets per each CRM's own object model, never touching fields ([#39](https://github.com/keng009/fulcra-dealflow-memory/issues/39)).

## Toward automatic — without losing consent

- **Scheduled message-sweep digest** ([#38](https://github.com/keng009/fulcra-dealflow-memory/issues/38)): the behavior is now specified in the full skill (Tend rule 5) — a recurring sweep presenting a one-yes Tend delta; what remains is the live scheduled run that promotes it from designed to tested.
- **Zero-touch auto-commit** stays explicitly out of scope until it gets its own ADR: it changes the consent posture (ADR-0005) and will be a per-user opt-in decision, not a default.

## Team pipelines — shared memory across a partnership

The most-requested future: partners at one firm sharing touchpoint streams — "has anyone here talked to this founder?" across the team. Scoped as questions, not code, in [#27](https://github.com/keng009/fulcra-dealflow-memory/issues/27), because it's gated on platform sharing capabilities and permission granularity that must be live before anything ships against them.

## Platform alignment

Migrating the `Dealflow Touchpoint` type to the platform's newer record-type surface when its write+query path is live, with a migration story for existing records (tracked inside [#27](https://github.com/keng009/fulcra-dealflow-memory/issues/27)'s question set until it becomes its own issue).

## The sibling

[fulcra-raise-memory](https://github.com/keng009/fulcra-raise-memory) serves the other side of the table (founders raising) as a deliberate product fork ([ADR-0007](docs/adr/0007-sibling-product-fork.md)) with [its own roadmap](https://github.com/keng009/fulcra-raise-memory/blob/main/ROADMAP.md). Features diverge by ICP; engine fixes cherry-pick.
