---
title: How does Kubernetes actually run a Pod?
type: chain
topic: kubernetes
tags: kubernetes, control-plane, architecture
---

## Question

What is Kubernetes, and what happens between you applying a Deployment and a container running on a machine?

## Short answer

Kubernetes runs containers across a fleet of machines. You declare the desired state, and it keeps reality matching it. `kubectl apply` sends the spec to the API server, which stores it in etcd. Controllers notice more Pods are needed and create them. The scheduler assigns each Pod to a node. The kubelet on that node has the container runtime start the containers and reports status back. Services give Pods stable networking.

## Follow-ups

### Who makes sure the desired state is maintained?

The control plane. The API server is the front door; everything talks to the cluster through it, and only the API server reads and writes etcd. Controllers watch the API server and reconcile: if a Deployment wants 3 replicas and only 2 Pods exist, the ReplicaSet controller creates another.

### The controller created a Pod. How does it land on a machine?

The scheduler watches for Pods with no node assigned. It filters nodes that can fit the Pod's resource requests and constraints, scores them, and records the chosen node through the API server. It only decides where the Pod runs; it doesn't start anything.

### So who starts the container?

The kubelet, one per node. It sees a Pod assigned to its node, has the container runtime (like containerd) pull the image and start the containers, runs the probes, and reports status to the API server. If a container fails, the kubelet restarts it according to the Pod's restart policy.

### How do Pods talk to each other?

The cluster network is flat: every Pod gets its own IP and can reach every other Pod (unless NetworkPolicies restrict it). Pod IPs change when Pods are replaced, so you never hard-code them. A Service gives a stable virtual IP and DNS name, like `orders.default.svc.cluster.local`, and kube-proxy or the network plugin routes it to healthy Pods.

### What's the single most important thing to back up?

etcd. It holds all cluster state, so backing it up backs up the cluster's configuration. Persistent volume data is separate and needs its own backups.

## Diagram

```
You ─> API Server ─> etcd
Controllers ─> create or update Pods to match desired state
Scheduler   ─> picks a node for each new Pod
Kubelet     ─> runs the Pod's containers on that node
Service     ─> stable IP and DNS for a set of Pods
```

## Listen for

- Declarative desired state and reconciliation loops
- Only the API server talks to etcd
- Scheduler decides, kubelet does
- Services instead of Pod IPs

## Pitfalls

- Saying the scheduler starts containers.
- Saying an etcd backup includes your application data in volumes.
