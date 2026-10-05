---
title: How do you debug a slow API?
type: scenario
topic: observability
tags: observability, performance, debugging
---

## Question

Users say an API endpoint got slow. Walk me through how you debug it.

## Short answer

Get data before guessing. Confirm it with latency percentiles on dashboards, check what changed recently, then use traces of slow requests to find which span takes the time: database, a downstream call, or the service itself. Use logs for that span to see why. Fix the bottleneck, then verify with the same metrics that latency came back down.

## Steps

1. **Confirm and scope it.** p95 and p99 latency, error rate and status codes. One endpoint or all? All users or one region? When did it start?
2. **Check recent changes.** Deploys, config changes, feature flags, traffic spikes. Most incidents follow a change.
3. **Find where the time goes** with traces:
   - Database query time: slow queries, missing indexes, lock waits, connection pool exhaustion
   - Downstream and third-party calls: latency, timeouts, retries
   - Network latency
   - Synchronous work that could be async
   - The service's own CPU, memory, garbage collection and IO
4. **Fix the bottleneck.** Add an index, cache, set timeouts, make a call async, roll back the deploy.
5. **Verify** with the same metrics, and add an alert so it's caught earlier next time.

## Follow-ups

### The traces show the database span is slow. Next?

Look at the query plan with `EXPLAIN ANALYZE` for missing indexes or full scans. Check for lock contention and whether the connection pool is maxed out, which looks like waiting for a connection.

### Average latency looks fine but users complain. Why?

Averages hide the tail. Check p95 and p99; a small share of very slow requests can ruin it for many users, especially when one page makes many calls.

### What would you do first if it's an active incident?

Mitigate first. If it started with a deploy, roll back, then investigate.

## Listen for

- Data first: metrics, traces, logs
- What changed?
- Percentiles, not averages
- Verify the fix

## Pitfalls

- Jumping straight to "add more servers" without finding the bottleneck.
