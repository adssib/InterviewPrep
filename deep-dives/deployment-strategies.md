---
title: Deployment strategies compared
type: compare
topic: deployment
tags: deployment, cicd, release
---

## Question

Compare the main deployment strategies. When would you pick each?

## Short answer

Recreate is simple but has downtime. Rolling replaces instances gradually with no downtime but mixes versions. Blue-green runs both and switches traffic, so rollback is instant at double cost. Canary sends a small slice of traffic to the new version and grows it while watching metrics. Shadow copies traffic to the new version without users seeing it. A/B splits users to compare product outcomes, not to check safety.

## Comparison

| Strategy | How | Pros | Cost / risk | When |
| --- | --- | --- | --- | --- |
| Recreate | Stop old, start new | Simple, no version mixing | Downtime | Small systems, or versions that can't run together |
| Rolling | Replace instances gradually | No downtime, no extra capacity | Old and new run at once | Default for most services |
| Blue-green | Run both, switch traffic | Instant rollback | 2× resources during switch | Major releases, strict rollback needs |
| Canary | Small % to new, then increase | Limits blast radius | Needs good metrics and automation | Risky changes |
| Shadow | Copy traffic to new, ignore its responses | Test with real traffic safely | Extra resources, watch side effects | Performance and correctness testing |
| A/B | Split users between variants | Measures user impact | More complexity | Comparing product behavior |

## Follow-ups

### What do rolling, canary and blue-green all require of your code?

Backward compatibility. Old and new versions run at the same time, so APIs, messages and the database schema must work with both. Use expand and contract for schema changes.

### Canary vs A/B test?

A canary asks "is the new version safe?" using health metrics like errors and latency. An A/B test asks "which variant is better for users?" using product metrics like conversion.

### What's the risk with shadow traffic?

Side effects. If the shadow version writes to a database, charges cards or sends emails, mirrored requests do it twice. Stub or isolate those.

## Listen for

- Downtime vs cost vs risk trade-off for each
- Backward compatibility during rollout
- Automated rollback based on metrics

## Pitfalls

- Treating A/B testing as a deployment safety mechanism.
