# lefolio.app

Draft a `Home.md` with lefolio `::: component` syntax, attach references, and send the package to your coding agent.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Visual language aligned with [lefolio.md](https://lefolio.md)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

GitHub Pages (project site): [https://lefolio.github.io/app/](https://lefolio.github.io/app/)

Push to `main` / `master` runs `.github/workflows/deploy.yml` (`VITE_BASE=/app/`).

Agent handoff design notes live in the Academic wiki: `wiki/lefolio/Design/agent_handoff.md`.
