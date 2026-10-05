---
title: Ansible vs Terraform
type: compare
topic: terraform
tags: terraform, ansible, iac
---

## Question

What's the difference between Ansible and Terraform? Would you use both?

## Short answer

Terraform provisions infrastructure (VMs, networks, load balancers, databases) declaratively and tracks it in a state file. Ansible configures machines that already exist (installs packages, edits config files, starts services) by running tasks over SSH. Ansible has no state file. Many teams use Terraform to create servers and Ansible to configure them.

## Comparison

| | Terraform | Ansible |
| --- | --- | --- |
| Main job | Create and manage infrastructure | Configure servers and software |
| Style | Declarative end state | Ordered tasks in playbooks (modules are mostly idempotent) |
| State | State file tracks what exists | No state file; checks the machine each run |
| Removing things | Delete it from code and it gets destroyed | You write a task to remove it |
| Agent | None; calls cloud APIs | None; connects over SSH |

## Follow-ups

### Why does the state file matter for the difference?

Because Terraform remembers what it created, removing a resource from code means it gets destroyed. Ansible doesn't remember; if you delete a task, whatever it installed stays on the machine.

### Would containers change this?

Yes. With immutable images and Kubernetes, there's less server configuration to do, so Ansible matters less. Terraform still provisions the cluster and cloud resources.

## Listen for

- Provisioning vs configuration
- Stateful vs stateless
- They're complementary

## Pitfalls

- Saying Ansible can't be idempotent. Most of its modules are, as long as you use them instead of raw shell commands.
