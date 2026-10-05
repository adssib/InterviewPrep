---
title: What happens when you run terraform apply?
type: chain
topic: terraform
tags: terraform, iac, state
---

## Question

Walk me through what happens when you write some Terraform and run `terraform apply`.

## Short answer

Terraform is declarative: I describe the end state, say three EC2 instances and a load balancer. Terraform reads my config and the state file, refreshes against the real cloud, and works out what to create, change or destroy. It shows me that plan, and when I approve, providers make the actual API calls in dependency order. Afterwards it records the result in state.

## Follow-ups

### How does Terraform know what reality looks like?

The state file (`terraform.tfstate`, JSON) maps each resource in my code to a real resource ID and its attributes. Before planning, Terraform refreshes that state by reading the real resources from the cloud.

### What does terraform plan do exactly?

It compares desired config against refreshed state and shows the exact create, update and destroy actions `apply` would take, without changing anything. In CI you save it with `-out=tfplan` and apply that exact plan.

### Who actually calls the cloud?

Providers, which are plugins: the AWS provider, Azure provider and so on. Terraform core reads the config, builds a dependency graph, and works out the order. The provider turns each resource block into real API calls. Core plans and orders; the provider talks to the cloud.

### Two engineers run apply on the same infrastructure. What stops them stepping on each other?

A remote backend with state locking, such as S3 with locking or Terraform Cloud. The first `apply` takes a lock and the second waits or fails until it's released. Locking only works if the backend supports it; plain local state has no protection.

### Someone changed a resource by hand in the console. What happens?

That's drift. Nothing happens on its own. The next `plan` refreshes, notices the difference and shows it. `apply` changes the resource back to match the code. If the manual change was intentional, update the code instead.

## Diagram

```
.tf files ─┐
           ├─> Terraform core: refresh, diff, dependency graph ─> plan
state ─────┘                                                     │
                                          apply ─> providers ─> cloud APIs
                                                                 │
                                                       state updated
```

## Listen for

- Declarative: you write the end state, Terraform works out the steps
- State maps code to real resources
- Core vs providers split
- Remote backend plus locking
- Drift shows up at plan time

## Pitfalls

- Saying Terraform watches the cloud continuously. It only checks when you run plan or apply.
- Editing the state file by hand. Use `terraform state` commands, `import` or `moved` blocks.
