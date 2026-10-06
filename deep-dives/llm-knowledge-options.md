---
title: Context window vs RAG vs fine-tuning vs tools
type: compare
topic: rag
tags: llm, rag, fine-tuning, mcp
---

## Question

You need an LLM to use information it wasn't trained on. When do you put it in the prompt, use RAG, fine-tune, or connect tools through APIs or MCP?

## Short answer

Small, request-specific info goes straight into the context. Large or frequently changing knowledge goes in RAG, retrieved per query with citations. Fine-tuning is for stable behavior, style and format, not changing facts. Live data or actions need tools, through APIs or MCP. Real systems combine them.

## Comparison

| | Data | Latency | Cost | Use when |
| --- | --- | --- | --- | --- |
| Context window | Per request | Low to medium | Paid per token, every request | Small, relevant info: instructions, a document, recent conversation |
| RAG | Large, changes often | Medium (retrieval step) | Low to medium: embeddings, storage, search | Big or changing knowledge bases, answers that need sources |
| Fine-tuning | Stable | Low (baked in) | High upfront, then cheap per request | Consistent behavior, format, style or narrow skills |
| Tools via APIs / MCP | Live | Higher (extra round trips) | Engineering effort plus API costs | Live data, or taking actions in other systems |

## Follow-ups

### Why not just fine-tune on the company docs?

Docs change, and you'd retrain every time. Fine-tuning is unreliable at storing facts and can make the model confidently wrong. RAG updates by re-indexing and can cite sources.

### Why not paste everything into a huge context window?

Cost and latency scale with tokens on every request, and models use details buried in the middle of long contexts less reliably. Retrieve only what's relevant.

### Where does MCP fit?

MCP is a standard way to plug tools and data sources into an AI app, so one server works with any compatible client. Use it when the model needs live data or must act, like querying a database or creating a ticket.

## Listen for

- Facts → RAG, behavior → fine-tuning, live data or actions → tools
- Cost and latency trade-offs for each
- Combining them is normal

## Pitfalls

- Treating fine-tuning as the way to add knowledge.
