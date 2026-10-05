---
title: Pre-launch production checklist
type: checklist
topic: cicd-sre
tags: sre, launch, reliability
---

## Question

You're about to launch a new service to production. What do you check before going live?

## Short answer

Make sure it's observable, tested under load, and reversible: health checks and dashboards work, alerts are set up and routed, it's been load tested, dependencies are healthy, and there's a tested rollback plan.

## Checklist

- [ ] Health checks and uptime monitoring on every API
- [ ] Dashboards for error rate, latency (p95/p99) and traffic
- [ ] Alerts configured, routed to on-call, with runbooks
- [ ] Logs and traces flowing and searchable
- [ ] Database health: query latency, connection pool size, CPU, storage, locks and slow queries
- [ ] CPU, memory and disk headroom on hosts
- [ ] External dependencies healthy, with timeouts and retries set
- [ ] Load and stress testing completed at expected peak
- [ ] Rollback plan written and actually tested
- [ ] Backups configured and a restore tested
- [ ] Launch plan: gradual rollout (canary or feature flag), who's watching, and when to abort

## Follow-ups

### Why test the rollback, not just write it down?

An untested rollback often fails exactly when you need it: a migration that can't be undone, a missing old image, a broken script.

### What does "drops or spikes in traffic" tell you after launch?

A sudden drop can mean clients can't reach you (DNS, auth, a bad deploy). A spike can be retries amplifying a failure, a bot, or real demand you need to scale for.

## Listen for

- Observability before launch, not after
- Load testing
- Reversibility: rollback and gradual rollout
