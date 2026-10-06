---
title: How many servers do you need?
type: estimate
topic: system-design
tags: system-design, capacity, estimation
---

## Question

You're launching a service with 1 million daily active users. How many servers do you need?

## Short answer

State assumptions, then do the math out loud: 1M users × 20 requests a day = 20M requests a day, about 230 per second on average. Peak at 5× is about 1,150 per second. If one server handles 500 per second and I keep it at 70% (350), I need 4 servers for peak, plus 1 spare for redundancy: 5.

## Steps

1. **Assume usage:** 20 requests per user per day.
2. **Daily total:** 1,000,000 × 20 = 20,000,000 requests/day.
3. **Average rate:** 20,000,000 ÷ 86,400 seconds ≈ **231 req/s**.
4. **Peak:** traffic isn't flat, so multiply by 2 to 5. At 5×: ≈ **1,160 req/s**.
5. **Per-server capacity:** say 500 req/s from load testing. Target 70% utilization for headroom: **350 req/s** each.
6. **Servers:** 1,160 ÷ 350 ≈ 3.3, round up to **4**.
7. **Redundancy:** add at least 1 so losing a server (or an availability zone) doesn't overload the rest: **5**, spread across zones.

## Follow-ups

### Where does the 500 req/s per server come from?

Load testing your actual service on the actual instance type. Never guess it in production; say in the interview that you'd measure it.

### What else would you estimate?

Storage (records per day × size × retention), bandwidth (requests × response size), and database load, which is often the real bottleneck before app servers.

### How does autoscaling change the answer?

Run the baseline with headroom, and let autoscaling add servers for peaks. You still need the estimate to set minimums, maximums and budgets.

## Listen for

- Assumptions stated out loud
- Average vs peak
- Headroom (don't plan for 100% utilization)
- Redundancy, N+1

## Pitfalls

- 20M ÷ 86,400 is about 230, not 200. Small rounding errors grow after multiplying by peak factors.
- Forgetting the database and other shared dependencies.
