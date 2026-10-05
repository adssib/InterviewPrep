---
title: How do you stop AI crawlers?
type: scenario
topic: system-design
tags: security, bots, rate-limiting
---

## Question

Bots are scraping your site's content to train AI models. How would you detect and stop them?

## Short answer

Layer defenses. `robots.txt` stops polite crawlers. Rate limits per IP, account and API key slow the rest. Then profile behavior (request rate, navigation patterns, headers, datacenter IPs), add honeypot links, and use a WAF or bot protection service. Score each client's likelihood of being a bot and respond in proportion: monitor or throttle at low confidence, challenge or block at high confidence.

## Steps

1. **robots.txt.** Disallow known AI crawler user agents. Only compliant crawlers obey it.
2. **Rate limiting.** Per IP, account, API key. Return 429.
3. **Behavioral signals:**
   - Request frequency and timing between requests
   - Pages visited and navigation patterns (no CSS or image loads, perfect sequential crawling)
   - Headers and User-Agent consistency
   - IP reputation, ASN, datacenter ranges
4. **Honeypots.** Hidden links no human would click; anything that follows them is a bot.
5. **WAF / bot protection.** Challenge or block suspicious traffic.
6. **Detection model.** Combine signals into a score, keep updating it as bots adapt.
7. **Action by confidence.** Low: monitor or throttle. High: challenge or block.

## Diagram

```
Signals → Profile → Score confidence → Throttle / Challenge / Block
```

## Follow-ups

### Why not just block by User-Agent?

It's trivially spoofed. Bad crawlers pretend to be Chrome. Use it as one signal among many.

### How do you avoid blocking real users or good bots?

Act in proportion to confidence, start with throttling or challenges rather than hard blocks, and verify good bots (like search engines) by reverse DNS rather than trusting their User-Agent.

## Listen for

- Layered defense
- robots.txt is voluntary
- Confidence-based response
