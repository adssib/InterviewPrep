---
title: Docker image is too big
type: scenario
topic: docker
tags: docker, security, performance
---

## Question

Your Node.js service's Docker image is over 1 GB. How do you shrink it, and why does it matter?

## Short answer

Use a multi-stage build so compilers, dev dependencies and source files stay in a build stage and only the built output reaches the final image. Start the final stage from a small base like a current Node LTS on Alpine, or distroless. Add a `.dockerignore` so `node_modules`, `.git` and local junk never enter the build context. Smaller images pull faster, start faster, and give attackers less to work with.

## Steps

1. **Multi-stage build.** Stage 1 installs everything and builds. Stage 2 copies only the build output and production dependencies.
2. **Smaller base image.** `node:<lts>-alpine` instead of the full Debian `node:<lts>` image. Distroless goes further: no shell, no package manager.
3. **`.dockerignore`.** Exclude `node_modules`, `.git`, test files, `.env`.
4. **Production dependencies only.** `npm ci --omit=dev` in the final stage.
5. **Layer order.** Copy `package*.json` and install before copying the source, so dependency layers stay cached.

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```

## Follow-ups

### Why is shipping build tools to production a security problem?

Every extra binary and package is attack surface and a source of CVEs in your scan reports. If the app is compromised, a shell, compilers and package managers make the attacker's job easier.

### Alpine vs distroless?

Alpine is small and still has a shell, which helps with debugging. Distroless has no shell or package manager, so it's smaller and harder to abuse, but you debug with ephemeral debug containers instead of `exec sh`. Alpine uses musl instead of glibc, which occasionally breaks native modules.

### How do you see what's taking space?

`docker history <image>` shows the size of each layer. Tools like `dive` let you browse layers and find large files.

## Listen for

- Multi-stage build, and the reason: build tools don't belong in production
- Small base image, with the trade-off named
- `.dockerignore` and layer caching order

## Pitfalls

- The file is `.dockerignore` (no underscore).
- Don't pick an end-of-life Node version like 18; use a current LTS.
- Deleting files in a later `RUN` doesn't shrink the image; they still exist in the earlier layer.
