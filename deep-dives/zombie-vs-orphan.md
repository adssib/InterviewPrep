---
title: Zombie vs orphan processes
type: scenario
topic: linux
tags: linux, processes, os
---

## Question

In `ps aux` you see a process with STAT `Z` and `<defunct>`. `kill -9` does nothing. What is it, and how do you get rid of it?

## Short answer

It's a zombie: the process has already exited, so there's nothing left to kill. Linux keeps its process table entry so the parent can read the exit status with `wait()`, which is called reaping. The fix is the parent: make it reap its children, or if it's broken, restart or kill the parent. Then PID 1 (init or systemd) adopts the zombie and reaps it.

## Follow-ups

### Why doesn't kill -9 work?

Signals go to running processes. A zombie isn't running; it's only an entry in the process table waiting for its parent to collect the exit status.

### Does a zombie use resources?

No CPU and no memory, but it keeps its PID and process table slot. Hundreds or thousands of zombies can exhaust the PID limit so no new processes can start. That's why lots of zombies matter.

### What's an orphan?

A child that's still running healthily after its parent died. Linux reparents it to PID 1, which will `wait()` on it when it exits. Orphans are harmless.

### How do you find the parent?

`ps -o ppid= -p <zombie_pid>` gives the parent PID, or look at the PPID column in `ps -ef`.

### Why does this matter in containers?

Your app is often PID 1 in the container, and most apps don't reap children. Use an init like `tini` (`docker run --init`) so zombies get cleaned up.

## Listen for

- Zombie = already dead, waiting to be reaped with `wait()`
- Fix the parent, not the child
- Orphans get adopted by PID 1
- Many zombies = a bug in the parent

## Pitfalls

- Saying zombies use CPU or memory. They don't; the risk is running out of PIDs.
