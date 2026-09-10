# Coursify

Turn any topic into a complete, fact-checked course. A team of Claude-powered
agents researches the subject, checks the research for quality, and writes it
up as a structured course — no prompt engineering required, just type a topic.

**Live app:** [coursify](https://web-delta-nine-56.vercel.app)

## How it works

Every request runs through a small multi-agent pipeline:

```
topic ──▶ Researcher ──▶ Judge ──▶ Content Builder ──▶ course
              ▲             │
              └── feedback ─┘   (loops up to 3x until research passes review)
```

1. **Researcher** — turns the topic into a search query, pulls the most
   relevant Wikipedia articles, and asks Claude to synthesize them into a set
   of findings.
2. **Judge** — reviews those findings for accuracy, coverage, and quality. If
   they fall short, it sends specific feedback back to the Researcher for
   another pass (up to 3 attempts).
3. **Content Builder** — once research passes review, writes the findings up
   as a complete, well-organized course.

Progress streams back to the browser in real time so you can watch each agent
work.

## Project structure

This repo contains two implementations of the same idea:

```
.
├── web/            # Primary app — Next.js + Vercel AI SDK (deployed to Vercel)
│   ├── app/             # Routes, streaming API endpoint, global styles
│   ├── components/      # Chat UI, sidebar, progress steps, course renderer
│   └── lib/
│       ├── agents/      # Researcher, Judge, Content Builder (Claude + Wikipedia)
│       ├── orchestrator.ts  # Runs the research → judge → build loop
│       └── history.ts   # Client-side course history (localStorage)
│
├── agents/          # Distributed microservices version — Google ADK + A2A protocol
│   ├── orchestrator/    # Main entry point (LoopAgent + SequentialAgent)
│   ├── researcher/      # Standalone agent, Google Search-backed
│   ├── judge/            # Standalone agent, evaluates research quality
│   └── content_builder/ # Standalone agent, compiles the final course
├── app/              # Web app service that talks to the Orchestrator agent
└── shared/           # Code shared across the ADK agents (symlinked in)
```

`web/` is the actively developed, deployed version — a single Next.js app
using the [Vercel AI SDK](https://sdk.vercel.ai) and Wikipedia's public API
directly, with no separate backend services to run. `agents/` is an
alternate, distributed implementation built on Google's [Agent Development
Kit](https://google.github.io/adk-docs/) (ADK) with each agent deployed as
its own Cloud Run service.

## Quick start (web app)

Requirements: Node.js 20+, an [Anthropic API key](https://console.anthropic.com/).

```bash
cd web
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy

The app is set up for [Vercel](https://vercel.com):

```bash
cd web
vercel        # preview deployment
vercel --prod # promote to production
```

Set `ANTHROPIC_API_KEY` (and optionally `CLAUDE_MODEL`) in the Vercel
project's environment variables.

## Quick start (ADK microservices)

Requirements: [`uv`](https://docs.astral.sh/uv/), Google Cloud SDK, and
credentials for Vertex AI.

```bash
uv sync
gcloud auth application-default login   # ensure GOOGLE_CLOUD_PROJECT is set
./run_local.sh                          # starts all 4 agents + web app
```

Open [http://localhost:8000](http://localhost:8000).

See the agent-by-agent Cloud Run deployment steps in
[`agents/`](./agents) — each service deploys independently, then the
Orchestrator is configured with the other services' URLs.

## Tech stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **AI:** [Vercel AI SDK](https://sdk.vercel.ai) with Claude (Anthropic)
- **Research source:** Wikipedia public API
- **Alternate backend:** Google Agent Development Kit (ADK), Agent-to-Agent (A2A) protocol, Cloud Run
