---
title: Backend dev checklist before shipping
type: checklist
topic: api-design
tags: security, api, backend
---

## Question

Before you ship a new backend feature, what do you check for security and reliability?

## Short answer

Authorization on every data access, validated input, protections like rate limits and CORS, safe errors, no hard-coded secrets, timeouts and retries on every external call, observability, tests, and a rollback plan.

## Security

- [ ] Users can only access their own data (check ownership on every request, not just authentication)
- [ ] Input validated and sanitized: SQL injection (parameterized queries), XSS (output encoding), unexpected types and sizes
- [ ] Authentication and authorization on every endpoint
- [ ] CORS limited to the origins that need it
- [ ] Rate limiting per user or API key, and per IP or region if needed
- [ ] Password reset links expire and work only once
- [ ] Errors don't expose stack traces or internals
- [ ] Secrets not hard-coded; they come from a secrets manager
- [ ] Sensitive data encrypted in transit and at rest
- [ ] Dependencies scanned for known vulnerabilities

## Reliability

- [ ] Database indexes in place and query performance checked
- [ ] Timeouts on API requests, database queries, third-party calls and service-to-service calls
- [ ] Retries with backoff and jitter, only for idempotent operations
- [ ] Logging with request IDs, plus metrics and alerts
- [ ] Tests passing
- [ ] Rollback plan

## Follow-ups

### What's the most common access-control bug?

Broken object-level authorization (IDOR): `GET /orders/123` returns order 123 to any logged-in user because the code checks login but not ownership. It's at the top of the OWASP API Security Top 10.

### Why only retry idempotent operations?

Retrying a non-idempotent request like "charge card" can do it twice. Use idempotency keys if you must retry those.

## Listen for

- Authorization, not just authentication
- Timeouts everywhere
- Safe retries
