---
title: Add a column to a 300M-row table with no downtime
type: scenario
topic: sql
tags: database, migrations, zero-downtime, deployment
---

## Question

You need to add a new column to a table with 300 million rows that's read and written 24/7. You can't afford downtime. How do you do it?

## Short answer

Expand and contract, in stages. Add the column as nullable, which is a fast metadata change. Deploy code that writes the new column for all new rows. Backfill old rows in small batches in the background, pausing if load gets high. Once every row is filled, add the constraint or default and any index without locking, then switch reads to the new column.

## Steps

1. **Add the column as nullable,** nothing else. In most databases this only changes metadata, so it's instant. (In Postgres 11+, adding a column even with a constant default is also instant.)
2. **Fix all new writes.** Deploy application code that fills the column on every insert and update. Old code must still work while the deploy rolls out.
3. **Backfill old rows** with a background job in small batches (say 10,000 rows), by primary key range. After each batch, check database load and replication lag, and pause if they're high. Make the job resumable.
4. **Finish the migration.** Add `NOT NULL` or a default once every row has a value. Build any index without blocking writes (`CREATE INDEX CONCURRENTLY` in Postgres). In Postgres, adding a `NOT NULL` check as `NOT VALID` first and validating it separately avoids a long lock.
5. **Switch reads** to the new column, and later remove any old column or code path (the "contract" step).

## Follow-ups

### Why not run one big UPDATE?

It would lock or rewrite huge parts of the table, bloat the transaction log, cause replication lag, and could block production traffic for a long time. Batches keep each transaction small.

### Why must each step work with both old and new code?

During a rolling deploy, old and new app versions run side by side. Each schema change has to be safe for both.

### How would you rename a column the same way?

Add the new column, write to both, backfill, switch reads to the new one, stop writing the old one, then drop it in a later release. Never rename in place on a live table.

## Listen for

- Expand and contract
- Metadata-only change first
- Batched, throttled, resumable backfill
- Constraints and indexes added without long locks

## Pitfalls

- Adding the column as `NOT NULL` with a volatile default in one step, which can rewrite the whole table on some databases.
