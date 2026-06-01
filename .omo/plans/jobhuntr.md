# jobhuntr - AI Job Hunting Platform

## TL;DR

> **Quick Summary**: AI-powered job hunting platform competing with aiapply/jobhire.ai featuring autonomous AI agents that traverse corporate portals, intelligent resume parsing/unification, ATS-optimization scoring, and robust backend queuing for scalable application automation.
>
> **Deliverables**:
- Next.js 14 web app with React Server Components, mobile-responsive UI
- Multi-agent orchestration (Scout, Analyst, Writer, Applier, Tracker) with LangGraph
- Resume parser supporting PDF/DOCX/TXT/HTML/OCR with data integrity guarantees
- ATS scoring engine with keyword density, semantic relevance, format parseability
- Backend queue system (BullMQ + Redis) with thread pool for browser automation
- REST API layer for future React Native mobile app
- NextAuth v5 authentication with LLM provider flexibility (Ollama/OpenAI/Anthropic/custom gateway)
>
> **Estimated Effort**: XL (large multi-phase project)
> **Parallel Execution**: YES - 4 waves with max 8 tasks per wave
> **Critical Path**: Wave 1 foundation → Wave 2 core modules → Wave 3 integration → Wave 4 advanced features

---

## Context

### Original Request
Build "jobhuntr" - a better version of jobhire.ai with:
- More user account options (multiple resumes, custom templates, multi-platform linking, team features, custom agent behaviors - all switchable)
- Better AI agents for traversing corporate portals with session preservation
- Resume parsing in multiple formats with data integrity guarantees
- Mobile-friendly + future React Native app support
- LLM flexibility: Ollama, OpenAI, Anthropic + custom gateway URL
- Full free access tier with everything locked down well
- Object-Oriented design patterns (no spaghetti code)
- Job list feed aggregation strategy
- Backend queuing/thread management
- Resume optimization with ATS scoring

### Interview Summary
**Key Discussions**:
- All major ATS platforms are priority targets (Greenhouse, Lever, Ashby, Workday, etc.)
- Sensitive fields (criminal history, visa status): AI extraction + user review + automation option
- LangGraph + Playwright for agent architecture
- Next.js 14 App Router with BFF pattern for mobile-ready
- NextAuth v5 for auth
- PostgreSQL + Prisma for database
- Target: Individual job seekers primarily, recruiter-friendly for future
- Agent behavior: Presets + overrides
- Monetization: Hybrid (Free + subscription + per-feature add-ons)
- Testing: TDD approach

### Research Findings
**AI Agent Architecture** (from OSS research):
- `phoneixvenkat/ai-job-agent`: 6-agent system (Scout, Analyst, Writer, Applier, Tracker, Email Intel) with LangGraph
- `gouthamreddykallem/job_applier_backend`: FastAPI + LangChain + Playwright + RabbitMQ + Redis
- `suhteevah/job-hunter-mcp`: Wraith Browser + CDP for Greenhouse/Lever/Ashby

**Job Feeds**:
- `jobo-enterprise`: 45+ ATS platforms (Greenhouse, Lever, Workday, Ashby)
- `Apify job-posting-aggregator`: Scrapes Indeed, LinkedIn, Greenhouse, Lever
- Canonical schema for normalization across sources

**Resume Optimization (ATS Scoring)**:
- Keyword density: 2.3-3.1% primary, 1.2-1.8% secondary (>4.5% triggers penalties)
- Semantic relevance scoring using transformer models
- Format parseability: Standard headers, MM/YYYY date format
- Recency weighting: Last 2 years = 1.0, exponential decay
- Target ATS score: 82-88 (not 100 - looks suspicious)

**Backend Queuing + Distributed Agentic Pattern**:
- **C2 (Command & Control)**: Main Next.js server orchestrates everything
- **Worker Nodes**: Separate processes/machines pull jobs from queue
- BullMQ (Redis-backed) for job queue across machines
- Fixed thread pool for browser workers (not spawning per job)
- Rate limiting per target site
- Circuit breakers for fault tolerance
- Priority queue for urgent vs background jobs

**Distributed Architecture**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMMAND & CONTROL (C2)                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐   │
│  │  Next.js │   │  Auth    │   │  API     │   │  WebSocket  │   │
│  │  Web UI  │   │  (NextAuth)│  │  Routes  │   │  Server     │   │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └──────┬───────┘   │
│       │               │               │                  │           │
│       └───────────────┴───────────────┴──────────────────┘           │
│                               │                                      │
│                    ┌──────────▼──────────┐                          │
│                    │   BullMQ (Redis)   │                          │
│                    │   Job Queue        │                          │
│                    │   + Status/Events  │                          │
│                    └──────────┬──────────┘                          │
└───────────────────────────────┼────────────────────────────────────┘
                                │ (Redis Pub/Sub + Streams)
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Worker Node 1 │     │  Worker Node 2 │     │  Worker Node N │
│  ┌───────────┐│     │  ┌───────────┐│     │  ┌───────────┐│
│  │ BullMQ    ││     │  │ BullMQ    ││     │  │ BullMQ    ││
│  │ Worker    ││     │  │ Worker    ││     │  │ Worker    ││
│  └───────────┘│     │  └───────────┘│     │  └───────────┘│
│  ┌───────────┐│     │  ┌───────────┐│     │  ┌───────────┐│
│  │ Browser   ││     │  │ Browser   ││     │  │ Browser   ││
│  │ Pool      ││     │  │ Pool      ││     │  │ Pool      ││
│  └───────────┘│     │  └───────────┘│     │  └───────────┘│
└───────────────┘     └───────────────┘     └───────────────┘
```

**Key Design Decisions**:
1. **C2 (Main Server)**: Next.js handles UI, auth, job submission, status tracking
2. **Workers (Remote Nodes)**: BullMQ workers on separate processes/machines
3. **Communication**: Redis streams for job distribution, WebSocket for real-time status
4. **Worker Registration**: Workers register with C2 on startup, heartbeat for liveness
5. **Job Assignment**: C2 pushes jobs to BullMQ, workers pull and process
6. **Result Aggregation**: Workers push results back via Redis, C2 notifies via WebSocket
7. **Scalability**: Add more worker nodes by deploying more worker processes
8. **Isolation**: Each worker node runs in its own process, crash doesn't affect others
9. **Configuration**: Worker nodes via environment vars (C2 Redis URL, LLM endpoint)

---

## Work Objectives

### Core Objective
Build a production-ready AI job hunting platform with autonomous application automation, intelligent resume processing, and scalable backend architecture.

### Concrete Deliverables
- User authentication with flexible LLM provider configuration
- Resume upload/parsing with data integrity validation
- Unified candidate profile with sensitive field confirmation workflow
- Job search across multiple ATS platforms and job boards
- AI-powered job matching and application automation
- ATS resume optimization scoring and suggestions
- Application tracking with status updates
- Mobile-responsive web UI
- REST API for future mobile app

### Definition of Done
- [ ] User can sign up, configure LLM provider, upload resume
- [ ] Resume parsed and unified into canonical profile
- [ ] Sensitive fields flagged for user confirmation before use
- [ ] Jobs searchable across Greenhouse, Lever, Ashby, Indeed, LinkedIn
- [ ] AI agent can autonomously fill forms on ATS platforms
- [ ] ATS optimization score calculated with actionable suggestions
- [ ] Application status tracked and displayed
- [ ] Mobile-responsive UI works on iOS/Android browsers
- [ ] REST API serves mobile-optimized payloads
- [ ] All core flows have TDD tests passing

### Must Have
- Multi-format resume parsing (PDF, DOCX, TXT, HTML, OCR images)
- Sensitive field extraction with user confirmation gates
- Multi-agent orchestration with session preservation
- BullMQ job queue with rate limiting
- Browser worker pool (not unbounded thread spawning)
- NextAuth v5 with credentials + OAuth providers
- PostgreSQL database with Prisma ORM
- Mobile-responsive Tailwind CSS UI
- LLM gateway abstraction (Ollama/OpenAI/Anthropic/custom URL)

### Must NOT Have (Guardrails)
- No LinkedIn credential-based scraping (anti-bot blocks)
- No payment processing (deferred to Phase 2)
- No direct job posting (aggregation only)
- No unbounded thread spawning (must use worker pool)
- No resume data used without user confirmation for sensitive fields
- No LLM provider calls without configured API keys
- No aggressive automation that triggers anti-bot detection

---

## Verification Strategy (MANDATORY)

**ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO - will be set up in Wave 1
- **Automated tests**: TDD (tests-first approach)
- **Framework**: Bun test + Vitest for React components
- **TDD Flow**: RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - scaffolding + infrastructure):
├── 1: Project scaffolding (Next.js 14, TypeScript, Tailwind)
├── 2: Database schema (Prisma, PostgreSQL)
├── 3: Authentication (NextAuth v5)
├── 4: LLM gateway abstraction layer
├── 5: Backend queue infrastructure (BullMQ + Redis)
├── 6: Browser automation infrastructure (Playwright pool)
├── 7: Worker Node Service (distributed agent infrastructure)
├── 8: Resume parsing pipeline (PDF/DOCX/TXT/HTML/OCR)

Wave 2 (Core Modules - max parallel):
├── 9: User accounts + profile management
├── 10: Resume unification + canonical profile
├── 11: Sensitive field confirmation workflow
├── 12: Job feed aggregation (ATS platforms)
├── 13: Job search + matching engine
├── 14: ATS optimization scoring engine
├── 15: AI agent orchestration (LangGraph)

Wave 3 (Integration + UI):
├── 16: Application automation + form filling
├── 17: Session preservation for portals
├── 18: Application tracking + status updates
├── 19: Mobile-responsive dashboard UI
├── 20: REST API for mobile app
├── 21: Agent behavior presets + overrides

Wave 4 (Advanced Features):
├── 22: Team/collaborative features
├── 23: Email intelligence agent
├── 24: Advanced proxy + anti-bot management
├── 25: Comprehensive TDD tests

Wave FINAL (Verification):
├── F1: Plan compliance audit
├── F2: Code quality review
├── F3: Real manual QA
└── F4: Scope fidelity check
```
├── 9: Resume unification + canonical profile
├── 10: Sensitive field confirmation workflow
├── 11: Job feed aggregation (ATS platforms)
├── 12: Job search + matching engine
├── 13: ATS optimization scoring engine
├── 14: AI agent orchestration (LangGraph)

Wave 3 (Integration + UI):
├── 15: Application automation + form filling
├── 16: Session preservation for portals
├── 17: Application tracking + status updates
├── 18: Mobile-responsive dashboard UI
├── 19: REST API for mobile app
├── 20: Agent behavior presets + overrides

Wave 4 (Advanced Features):
├── 21: Team/collaborative features
├── 22: Email intelligence agent
├── 23: Advanced proxy + anti-bot management
├── 24: Comprehensive TDD tests

Wave FINAL (Verification):
├── F1: Plan compliance audit
├── F2: Code quality review
├── F3: Real manual QA
└── F4: Scope fidelity check
```

### Dependency Matrix
```
1: - - 2, 3, 4, 5, 6, 7, 8
2: 1 - 9, 10
3: 1 - 9, 10
4: 1 - 9, 10, 14, 21
5: 1 - 7, 16, 17, 18
6: 1 - 7, 16, 17
7: 5, 6 - 16, 17, 18
8: 1 - 9, 10
9: 2, 3, 7 - 10
10: 7, 9 - 11
11: 9, 10 - 12, 14, 15
12: 9, 11 - 14, 15
13: 9, 10 - 14, 15, 21
14: 4, 11, 12, 13 - 16, 17, 18
15: 4, 11, 12, 13 - 21
16: 7, 14 - 17, 18
17: 7, 14 - 18
18: 7, 14, 16, 17 - 19, 20
19: 9, 18 - 21
20: 9, 18 - -
21: 4, 9, 13, 15, 19 - 22
22: 18, 20 - -
23: 5, 14 - -
24: 5, 6 - -
25: 1, 9, 14, 16, 17, 18 - F1
```

---

## TODOs

- [ ] 1. Project scaffolding (Next.js 14 + TypeScript + Tailwind + bun)

  **What to do**:
  - Initialize Next.js 14 project with App Router
  - Configure TypeScript strict mode
  - Set up Tailwind CSS with mobile-responsive config
  - Configure bun as package manager and test runner
  - Set up folder structure (app/, components/, lib/, types/, etc.)
  - Configure ESLint + Prettier

  **Must NOT do**:
  - No Pages Router (must use App Router)
  - No JavaScript (must be TypeScript)
  - No CSS modules (use Tailwind)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `next.js`]
  - `typescript`: Project uses strict TypeScript throughout
  - `next.js`: Next.js 14 App Router patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-7)
  - **Blocks**: Tasks 2, 3, 4, 5, 6, 7
  - **Blocked By**: None (can start immediately)

  **References**:
  - `https://nextjs.org/docs/app/building-your-application` - Next.js 14 App Router docs
  - `https://tailwindcss.com/docs/guides/nextjs` - Tailwind + Next.js setup

  **Acceptance Criteria**:
  - [ ] `bun create next-app jobhuntr --typescript --tailwind --app` succeeds
  - [ ] `bun tsc --noEmit` passes with strict mode
  - [ ] `bun dev` starts dev server on localhost:3000
  - [ ] Mobile breakpoint test passes (resize to 375px width)

  **QA Scenarios**:

  \`\`\`
  Scenario: Project scaffolding creates valid Next.js 14 app
    Tool: Bash
    Preconditions: No existing project files
    Steps:
      1. Run: bun create next-app . --typescript --tailwind --app --eslint --src-dir
      2. Verify: ls app/page.tsx exists
      3. Run: bun tsc --noEmit (should pass)
      4. Run: bun dev & (background)
      5. Wait 5s for server startup
      6. curl http://localhost:3000 (should return HTML)
    Expected Result: HTML page with "page" content renders
    Failure Indicators: TypeScript errors, server fails to start
    Evidence: .omo/evidence/task-1-scaffold.html

  Scenario: Mobile responsive Tailwind works
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Set viewport to 375x667 (iPhone SE)
      3. Verify no horizontal scroll
      4. Set viewport to 768x1024 (iPad)
      5. Verify layout adjusts
    Expected Result: Responsive layout at both breakpoints
    Failure Indicators: Horizontal overflow, layout breaks
    Evidence: .omo/evidence/task-1-mobile.png
  \`\`\`

  **Commit**: YES
  - Message: `feat(scaffold): initialize Next.js 14 + TypeScript + Tailwind project`
  - Files: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `app/`, `next.config.ts`

- [ ] 2. Database schema (PostgreSQL + Prisma)

  **What to do**:
  - Design Prisma schema for all entities (User, Resume, Profile, Job, Application, etc.)
  - Configure PostgreSQL connection
  - Create migrations
  - Seed script for development

  **Must NOT do**:
  - No MongoDB (must use PostgreSQL)
  - No TypeORM (must use Prisma)
  - No raw SQL (use Prisma client)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`prisma`, `postgresql`]
  - `prisma`: ORM for database access
  - `postgresql`: Database engine

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-7)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 1

  **References**:
  - `https://www.prisma.io/docs/orm/prisma-schema` - Prisma schema reference
  - Schema design patterns from `prisma/prisma1` repository

  **Acceptance Criteria**:
  - [ ] `prisma/schema.prisma` contains all entities
  - [ ] `bun prisma migrate dev` creates migration
  - [ ] `bun prisma generate` generates client
  - [ ] Database connection test passes

  **QA Scenarios**:

  \`\`\`
  Scenario: Prisma schema validates and generates client
    Tool: Bash
    Preconditions: PostgreSQL running locally or via Docker
    Steps:
      1. Create .env with DATABASE_URL="postgresql://user:pass@localhost:5432/jobhuntr"
      2. Run: bun prisma validate
      3. Run: bun prisma generate
      4. Verify: node_modules/.prisma/client exists
    Expected Result: Schema valid, client generated without errors
    Failure Indicators: Schema errors, client generation fails
    Evidence: .omo/evidence/task-2-schema.txt

  Scenario: All required entities exist in schema
    Tool: Bash
    Preconditions: Schema exists at prisma/schema.prisma
    Steps:
      1. Read prisma/schema.prisma
      2. Verify models: User, Resume, CanonicalProfile, Job, Application, AgentConfig
      3. Verify relations between models
    Expected Result: All models present with correct relations
    Failure Indicators: Missing models, broken relations
    Evidence: .omo/evidence/task-2-models.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(db): add Prisma schema with all entities`
  - Files: `prisma/schema.prisma`, `.env.example`

- [ ] 3. Authentication (NextAuth v5)

  **What to do**:
  - Configure NextAuth v5 with credentials + OAuth providers
  - Create auth API routes
  - Set up session handling with JWT
  - Create login/logout/register UI components
  - Implement role-based access (user, admin)

  **Must NOT do**:
  - No client-side-only auth (must use server sessions)
  - No storing passwords in plaintext (must hash with bcrypt)
  - No session tokens in URL

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`next-auth`, `typescript`]
  - `next-auth`: Auth.js v5 configuration
  - `typescript`: Type-safe auth types

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4-7)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 1

  **References**:
  - `https://authjs.dev/getting-started` - NextAuth v5 docs
  - `https://github.com/zenWai/nextjs14-next-authv5-app-router` - Reference impl

  **Acceptance Criteria**:
  - [ ] User can register with email/password
  - [ ] User can login with registered credentials
  - [ ] OAuth Google login works
  - [ ] Protected routes redirect to login
  - [ ] Session persists across requests

  **QA Scenarios**:

  \`\`\`
  Scenario: User registration creates account
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /auth/register
      2. Fill form: name="Test User", email="test@example.com", password="Test123!"
      3. Submit form
      4. Verify redirect to dashboard or login
      5. Check database: User record exists
    Expected Result: Account created, user can login
    Failure Indicators: Registration fails, no DB record
    Evidence: .omo/evidence/task-3-register.html

  Scenario: Protected route redirects unauthenticated user
    Tool: Playwright
    Preconditions: No session cookie
    Steps:
      1. Navigate directly to /dashboard
      2. Verify redirect to /auth/login
      3. Login with test credentials
      4. Verify redirect back to /dashboard
    Expected Result: Proper redirect flow
    Failure Indicators: Protected page accessible without auth
    Evidence: .omo/evidence/task-3-protected.html
  \`\`\`

  **Commit**: YES
  - Message: `feat(auth): add NextAuth v5 with credentials + OAuth`
  - Files: `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts`, `app/(auth)/`

- [ ] 4. LLM gateway abstraction layer

  **What to do**:
  - Create abstract LLM provider interface
  - Implement OpenAI adapter (GPT-4o, GPT-4o-mini)
  - Implement Anthropic adapter (Claude 3.5 Sonnet, etc.)
  - Implement Ollama adapter (local models)
  - Implement custom gateway URL adapter (user's proxy)
  - Create provider configuration in user settings
  - Add token usage tracking

  **Must NOT do**:
  - No hardcoded API keys (must use env vars or user config)
  - No blocking API calls on main thread (async only)
  - No provider-specific logic outside adapters

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
  - **Skills**: [`typescript`, `architecture`]
  - `typescript`: Interface-driven design
  - `architecture`: OOP adapter pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-7)
  - **Blocks**: Tasks 8, 9, 14, 20
  - **Blocked By**: Task 1

  **References**:
  - Adapter pattern from `langchain/langchain` - LLM abstractions
  - `https://docs.anthropic.com/` - Claude API docs
  - `https://platform.openai.com/docs/` - OpenAI API docs
  - `https://github.com/ollama/ollama` - Ollama local models

  **Acceptance Criteria**:
  - [ ] `ILlmProvider` interface defines all required methods
  - [ ] `OpenAiProvider` implements interface with GPT-4o
  - [ ] `AnthropicProvider` implements interface with Claude 3.5
  - [ ] `OllamaProvider` implements interface for local models
  - [ ] `CustomGatewayProvider` implements interface for proxy URLs
  - [ ] Provider can be switched via user settings
  - [ ] All providers return structured chat completions

  **QA Scenarios**:

  \`\`\`
  Scenario: OpenAI provider returns chat completion
    Tool: Bash (bun REPL)
    Preconditions: OPENAI_API_KEY in env
    Steps:
      1. Import OpenAiProvider from lib/llm/providers
      2. Create provider instance
      3. Call provider.chat([{role: "user", content: "Say 'test'"]])
      4. Verify response contains "test"
    Expected Result: Valid chat completion returned
    Failure Indicators: API errors, wrong response format
    Evidence: .omo/evidence/task-4-openai.txt

  Scenario: Provider interface is consistent across implementations
    Tool: Bash (bun tsc)
    Preconditions: All provider files exist
    Steps:
      1. Run: bun tsc --noEmit
      2. Verify no interface mismatches
      3. Verify all providers have: chat(), embed(), getModelName()
    Expected Result: TypeScript compiles, interfaces match
    Failure Indicators: Missing methods, type errors
    Evidence: .omo/evidence/task-4-types.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(llm): add LLM gateway with OpenAI/Anthropic/Ollama/Custom adapters`
  - Files: `lib/llm/`, `types/llm.ts`

- [ ] 5. Backend queue infrastructure (BullMQ + Redis)

  **What to do**:
  - Set up Redis connection for job queue
  - Configure BullMQ queues (application, scraping, email)
  - Define job types and data structures
  - Set up worker processes
  - Implement rate limiting per target site
  - Implement circuit breakers for fault tolerance
  - Configure priority queues (urgent vs background)
  - Add job retry logic with exponential backoff

  **Must NOT do**:
  - No unbounded thread spawning (worker pool only)
  - No direct queue manipulation (use queue abstraction)
  - No hardcoded rate limits (configurable per target)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `architecture`, `redis`]
  - `typescript`: Type-safe job definitions
  - `architecture`: Worker pool + queue patterns
  - `redis`: BullMQ backend

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6, 7)
  - **Blocks**: Tasks 15, 16, 17
  - **Blocked By**: Task 1

  **References**:
  - `https://docs.bullmq.io/` - BullMQ documentation
  - `https://github.com/Optimal/bullmq-pro` - Pro features reference
  - Worker pool patterns from `gouthamreddykallem/job_applier_backend`

  **Acceptance Criteria**:
  - [ ] BullMQ queues created: application, scraping, email, optimization
  - [ ] Worker can process jobs from queue
  - [ ] Rate limiter prevents >1 req/sec to same domain
  - [ ] Circuit breaker trips after 5 consecutive failures
  - [ ] Jobs retry with exponential backoff (max 3 retries)
  - [ ] Priority queue processes urgent jobs first

  **QA Scenarios**:

  \`\`\`
  Scenario: Job is processed by worker and completes
    Tool: Bash
    Preconditions: Redis running on localhost:6379
    Steps:
      1. Add job to queue: queue.add('test', { data: 'test' })
      2. Start worker: node worker.js
      3. Wait 5s for processing
      4. Verify job state is 'completed'
      5. Verify job result stored
    Expected Result: Job processed, result stored
    Failure Indicators: Job stuck, worker crash
    Evidence: .omo/evidence/task-5-queue.txt

  Scenario: Rate limiter blocks excessive requests
    Tool: Bash (bun test)
    Preconditions: Rate limiter configured
    Steps:
      1. Create test: send 5 requests to same domain within 1 second
      2. First 1-2 succeed
      3. Remaining should be delayed/blocked
      4. Verify rate limit exceeded log message
    Expected Result: Rate limiting enforced
    Failure Indicators: All requests succeed immediately
    Evidence: .omo/evidence/task-5-ratelimit.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(queue): add BullMQ with rate limiting and circuit breakers`
  - Files: `lib/queue/`, `workers/`

- [ ] 6. Browser automation infrastructure (Playwright pool)

  **What to do**:
  - Set up Playwright with browser binaries
  - Create browser pool manager (fixed concurrent sessions)
  - Implement session profile management (cookies, localStorage)
  - Add stealth browser options (fingerprint randomization)
  - Set up proxy rotation support
  - Create page interaction abstractions (navigate, click, fill, submit)
  - Implement anti-bot detection handling

  **Must NOT do**:
  - No spawning browser per job (must use pool)
  - No hardcoded selectors (must use adaptive selectors)
  - No blocking browser operations on main thread

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`, `typescript`]
  - `playwright`: Browser automation
  - `typescript`: Type-safe page interactions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5, 7)
  - **Blocks**: Tasks 15, 16
  - **Blocked By**: Task 1

  **References**:
  - `https://playwright.dev/docs/api/` - Playwright API
  - `https://github.com/microsoft/playwright` - Browser pool patterns
  - `https://github.com/nickstenning/browser-use` - Agent browser patterns

  **Acceptance Criteria**:
  - [ ] Browser pool supports max 10 concurrent browsers
  - [ ] Browser can navigate to HTTPS://greenhouse.io
  - [ ] Session profile persists cookies between navigations
  - [ ] Stealth mode hides automation signals
  - [ ] Proxy rotation works when configured

  **QA Scenarios**:

  \`\`\`
  Scenario: Browser pool manages concurrent sessions
    Tool: Bash (bun test)
    Preconditions: Redis + BullMQ running
    Steps:
      1. Acquire browser from pool
      2. Navigate to httpbin.org/headers
      3. Verify User-Agent is stealth
      4. Release browser back to pool
      5. Acquire another browser (should reuse)
      6. Verify no cookies from previous session
    Expected Result: Pool manages sessions correctly
    Failure Indicators: Session leakage, pool exhaustion
    Evidence: .omo/evidence/task-6-pool.txt

  Scenario: Anti-bot detection triggers circuit breaker
    Tool: Bash
    Preconditions: Greenhouse board configured
    Steps:
      1. Navigate to greenhouse.io 10 times rapidly
      2. Detect bot challenge or 403
      3. Verify circuit breaker trips
      4. Subsequent requests blocked for 5 minutes
    Expected Result: Circuit breaker activates
    Failure Indicators: No protection, continues requests
    Evidence: .omo/evidence/task-6-cb.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(browser): add Playwright pool with session management`
  - Files: `lib/browser/`, `workers/browser-pool.ts`

- [ ] 7. Worker Node Service (distributed agent infrastructure)

  **What to do**:
  - Create standalone worker service that can run on separate machines
  - Implement worker registration with C2 (connect via WebSocket, send heartbeat)
  - Implement job pulling from BullMQ queue
  - Implement result aggregation back to C2 (via Redis pub/sub)
  - Create worker pool management (manage multiple concurrent jobs per worker)
  - Implement graceful shutdown and restart
  - Create worker health monitoring (memory, CPU, active jobs)
  - Configure via environment variables (Redis URL, C2 WebSocket URL, LLM endpoint, etc.)

  **Must NOT do**:
  - No direct database access from workers (go through C2 API)
  - No hardcoded C2 URL (must be configurable)
  - No blocking job processing (must be async with cancellation support)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `architecture`, `redis`]
  - `typescript`: Service implementation
  - `architecture`: Distributed systems patterns
  - `redis`: Pub/sub and queue communication

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-6)
  - **Blocks**: Tasks 15, 16, 17
  - **Blocked By**: Task 5 (queue), Task 6 (browser pool)

  **References**:
  - `https://docs.bullmq.io/guide/workers` - BullMQ worker patterns
  - `https://docs.bullmq.io/guide/producers-consumers` - Producer/consumer pattern
  - Worker registration patterns from `gouthamreddykallem/job_applier_backend`

  **Acceptance Criteria**:
  - [ ] Worker service can be started on separate machine: `node worker-service.js`
  - [ ] Worker connects to Redis queue and registers with C2
  - [ ] Worker pulls jobs from queue and executes them
  - [ ] Worker sends heartbeat every 30s to C2
  - [ ] Worker reports job results back via Redis pub/sub
  - [ ] C2 WebSocket receives worker status updates in real-time
  - [ ] Multiple workers can run concurrently on different machines
  - [ ] Worker gracefully shuts down when receiving SIGTERM
  - [ ] Worker reconnects automatically if Redis or C2 connection drops

  **QA Scenarios**:

  \`\`\`
  Scenario: Worker registers with C2 and receives heartbeat
    Tool: Bash
    Preconditions: C2 running on localhost:3000, Redis on localhost:6379
    Steps:
      1. Start worker: WORKER_C2_URL=ws://localhost:3000 REDIS_URL=redis://localhost:6379 node worker-service.js
      2. Verify worker connects to Redis
      3. Verify worker WebSocket connects to C2
      4. Verify worker sends registration message
      5. Wait 30s, verify heartbeat received by C2
      6. Check C2 logs show worker connected
    Expected Result: Worker registered, heartbeat working
    Failure Indicators: Connection failures, no registration
    Evidence: .omo/evidence/task-7-worker-register.txt

  Scenario: Worker pulls and processes job from queue
    Tool: Bash
    Preconditions: Worker running, C2 running
    Steps:
      1. C2 adds job to queue: { type: 'scrape', url: 'https://example.com' }
      2. Verify worker picks up job
      3. Verify worker processes job (browser automation)
      4. Verify worker sends result back via Redis
      5. Verify C2 receives result notification
      6. Verify job marked as completed in queue
    Expected Result: Job processed end-to-end
    Failure Indicators: Job stuck, no result returned
    Evidence: .omo/evidence/task-7-worker-job.txt

  Scenario: Multiple workers process jobs in parallel
    Tool: Bash
    Preconditions: 3 workers running on different ports
    Steps:
      1. Add 5 jobs to queue
      2. Verify each worker picks up jobs
      3. Verify jobs process concurrently (not sequentially)
      4. Verify all 5 jobs complete
      5. Verify C2 receives all results
    Expected Result: Parallel processing across workers
    Failure Indicators: Sequential processing, jobs not distributed
    Evidence: .omo/evidence/task-7-multi-worker.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(worker): add distributed worker node service with C2 registration`
  - Files: `worker-service/`, `lib/worker/`

- [ ] 8. Resume parsing pipeline (PDF/DOCX/TXT/HTML/OCR)

  **What to do**:
  - Implement PDF parsing (pdf-parse, pdf.js)
  - Implement DOCX parsing (mammoth)
  - Implement TXT parsing (native file read)
  - Implement HTML parsing (cheerio)
  - Implement OCR for images (tesseract.js)
  - Create structured extraction for contact, experience, education, skills
  - Normalize dates to ISO format
  - Extract and normalize company names, job titles
  - Create confidence scores for each field

  **Must NOT do**:
  - No extracting sensitive fields (criminal, visa) without user confirmation
  - No assuming date formats (must normalize)
  - No trusting extracted data blindly (confidence scores required)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `nlp`]
  - `typescript`: Parser implementation
  - `nlp`: Text extraction patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-6)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Task 1

  **References**:
  - `https://github.com/nickstenning/resume-parser` - Reference patterns
  - `https://affinda.com/blog/parse-resume-python/` - Production parsing approaches
  - `https://www.edenai.co/post/resume-parsing-ocr-which-solution-to-choose` - Multi-provider validation

  **Acceptance Criteria**:
  - [ ] PDF files parsed successfully (text extraction)
  - [ ] DOCX files parsed successfully
  - [ ] TXT files parsed successfully
  - [ ] HTML files parsed successfully
  - [ ] Images (PNG, JPG) OCR'd with tesseract
  - [ ] Contact info extracted (name, email, phone, location)
  - [ ] Work history extracted (company, title, dates, description)
  - [ ] Education extracted (institution, degree, dates)
  - [ ] Skills extracted as array
  - [ ] Confidence scores attached to each extraction
  - [ ] Dates normalized to YYYY-MM format

  **QA Scenarios**:

  \`\`\`
  Scenario: PDF resume is parsed correctly
    Tool: Bash
    Preconditions: Sample PDF resume at test/fixtures/resume.pdf
    Steps:
      1. Call parseResume(fileBuffer, 'pdf')
      2. Verify returned object has: name, email, experience[], education[], skills[]
      3. Verify dates are in YYYY-MM format
      4. Verify confidence scores attached
    Expected Result: Structured data extracted
    Failure Indicators: Parsing fails, data missing
    Evidence: .omo/evidence/task-7-pdf.json

  Scenario: Image resume is OCR'd
    Tool: Bash
    Preconditions: Sample image resume at test/fixtures/resume-ocr.jpg
    Steps:
      1. Call parseResume(fileBuffer, 'image')
      2. Verify tesseract extracts text
      3. Verify text is parsed into structured data
      4. Verify lower confidence for OCR vs native formats
    Expected Result: OCR text extracted and structured
    Failure Indicators: OCR fails, poor text quality
    Evidence: .omo/evidence/task-7-ocr.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(resume): add multi-format parsing pipeline`
  - Files: `lib/resume-parser/`, `types/resume.ts`

- [ ] 9. User accounts + profile management

  **What to do**:
  - Implement multi-resume support (users can have multiple resumes)
  - Implement resume version switching (active resume per user)
  - Create user profile with contact info, preferences
  - Implement custom application templates (saved answers to common questions)
  - Implement multi-platform account linking (LinkedIn, Indeed read-only)
  - Create team features foundation (invite users, share application status)
  - Implement agent behavior configuration per user

  **Must NOT do**:
  - No credential storage for linked accounts (read-only APIs only)
  - No team billing yet (B2C first)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `next.js`]
  - `typescript`: Type-safe user types
  - `next.js`: Server actions for mutations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 10-15)
  - **Blocks**: Tasks 10, 11, 12, 14, 15, 19, 20, 21
  - **Blocked By**: Task 2, 3, 7

  **References**:
  - User model patterns from Prisma schema
  - Multi-tenant patterns from `prisma/prisma1` examples

  **Acceptance Criteria**:
  - [ ] Users can upload and manage multiple resumes
  - [ ] Users can set active resume for applications
  - [ ] Users can create/edit application templates
  - [ ] Users can link read-only platform accounts
  - [ ] Users can configure agent behavior presets
  - [ ] Team invite system works (invite by email)

  **QA Scenarios**:

  \`\`\`
  Scenario: User manages multiple resumes
    Tool: Playwright
    Preconditions: Authenticated user
    Steps:
      1. Navigate to /profile/resumes
      2. Upload resume.pdf
      3. Verify parsed data shown
      4. Upload resume2.docx
      5. Verify both shown in resume list
      6. Set resume2 as active
      7. Verify active badge shown
    Expected Result: Multiple resumes managed correctly
    Failure Indicators: Upload fails, active not set
    Evidence: .omo/evidence/task-9-resumes.html

  Scenario: User creates application template
    Tool: Playwright
    Preconditions: Authenticated user
    Steps:
      1. Navigate to /profile/templates
      2. Create template "Tech SWE"
      3. Add saved answer: "Salary expectation" = "$150k"
      4. Add saved answer: "Start date" = "2 weeks notice"
      5. Save template
      6. Verify template appears in list
    Expected Result: Template created and persisted
    Failure Indicators: Template not saved, answers lost
    Evidence: .omo/evidence/task-9-template.html
  \`\`\`

  **Commit**: YES
  - Message: `feat(accounts): add multi-resume, templates, and profile management`
  - Files: `app/(dashboard)/profile/`, `lib/user/`

- [ ] 10. Resume unification + canonical profile

  **What to do**:
  - Create canonical profile schema (normalized user data)
  - Implement resume merging (combine multiple resumes intelligently)
  - Implement conflict resolution for duplicate entries
  - Create profile completeness scoring
  - Implement profile export (JSON, PDF)
  - Build profile editing with validation

  **Must NOT do**:
  - No automatic merging without user confirmation for conflicts
  - No data loss during merge (keep original sources)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `architecture`]
  - `typescript`: Schema validation
  - `architecture`: Data unification patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9, 11-15)
  - **Blocks**: Task 11
  - **Blocked By**: Task 2, 3, 7

  **References**:
  - Canonical schema patterns from `ever-jobs` normalization
  - Profile merge algorithms from recruitment platforms

  **Acceptance Criteria**:
  - [ ] Canonical profile created from parsed resume data
  - [ ] Multiple resumes merged into single profile
  - [ ] Conflicts flagged for user review
  - [ ] Profile completeness score calculated
  - [ ] Profile exported to JSON/PDF

  **QA Scenarios**:

  \`\`\`
  Scenario: Two resumes merged into canonical profile
    Tool: Bash (bun test)
    Preconditions: Two parsed resumes in database
    Steps:
      1. Call mergeResumes(resume1Id, resume2Id)
      2. Verify canonical profile created
      3. Verify experience from both merged
      4. Verify no duplicate jobs
      5. Verify skills combined
    Expected Result: Unified profile with all data
    Failure Indicators: Duplicates, missing data
    Evidence: .omo/evidence/task-10-merge.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(profile): add canonical profile with resume unification`
  - Files: `lib/profile/`, `types/profile.ts`

- [ ] 11. Sensitive field confirmation workflow

  **What to do**:
  - Implement sensitive field extraction (criminal history, visa status)
  - Create "NEEDS REVIEW" flag for sensitive fields
  - Build user confirmation UI for sensitive fields
  - Implement "auto-approve" option (user trusts extraction)
  - Implement "never extract" option (user enters manually)
  - Add audit log for sensitive field changes
  - Implement encryption for sensitive data at rest

  **Must NOT do**:
  - No sensitive field used in applications without explicit user confirmation
  - No false claims about criminal history or visa status
  - No storing sensitive data in logs

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `security`]
  - `typescript`: Validation logic
  - `security`: Encryption and audit patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9, 10, 12-15)
  - **Blocks**: Tasks 12, 14, 15
  - **Blocked By**: Task 7, 10

  **References**:
  - Data validation from `lib/validation` patterns
  - Encryption patterns for PII

  **Acceptance Criteria**:
  - [ ] Criminal history field flagged as NEEDS REVIEW
  - [ ] Visa status field flagged as NEEDS REVIEW
  - [ ] User must confirm before field used in applications
  - [ ] Auto-approve option works if user enables
  - [ ] Never-extract option keeps fields manual-only
  - [ ] Audit log records all sensitive field changes

  **QA Scenarios**:

  \`\`\`
  Scenario: Sensitive field requires user confirmation
    Tool: Playwright
    Preconditions: Resume with sensitive data parsed
    Steps:
      1. Navigate to /profile/confirmation
      2. Verify "Criminal History" shows NEEDS REVIEW badge
      3. Verify "Visa Status" shows NEEDS REVIEW badge
      4. Click confirm on each
      5. Verify badges change to "Confirmed"
      6. Verify application can now use these fields
    Expected Result: User confirms sensitive fields
    Failure Indicators: Confirmation not required
    Evidence: .omo/evidence/task-11-sensitive.html

  Scenario: Sensitive field auto-approve enabled
    Tool: Playwright
    Preconditions: User enabled auto-approve in settings
    Steps:
      1. Upload new resume with same criminal history
      2. Verify field auto-confirmed (no NEEDS REVIEW)
      3. Verify application uses field without prompting
    Expected Result: Auto-approve works
    Failure Indicators: Still prompts when should auto-approve
    Evidence: .omo/evidence/task-11-autoapprove.html
  \`\`\`

  **Commit**: YES
  - Message: `feat(sensitive): add sensitive field confirmation workflow`
  - Files: `lib/sensitive/`, `app/(dashboard)/profile/confirmation/`

- [ ] 12. Job feed aggregation (ATS platforms)

  **What to do**:
  - Integrate jobo-enterprise for ATS APIs (Greenhouse, Lever, Ashby, etc.)
  - Integrate Apify for job boards (Indeed, LinkedIn)
  - Implement canonical job schema normalization
  - Implement deduplication across sources
  - Create job search API with filters
  - Implement saved search + notifications
  - Add proxy rotation for scraping sources

  **Must NOT do**:
  - No LinkedIn credential-based scraping
  - No bypassing paywalls
  - No rate limit violations (enforce per-source limits)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `api-design`]
  - `typescript`: API integration
  - `api-design`: RESTful job endpoints

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-11, 13-15)
  - **Blocks**: Task 14
  - **Blocked By**: Task 9

  **References**:
  - `https://github.com/ever-jobs/ever-jobs` - Job aggregation patterns
  - `https://github.com/nickstenning/jobo-enterprise` - ATS API integration

  **Acceptance Criteria**:
  - [ ] Jobs fetched from Greenhouse API
  - [ ] Jobs fetched from Lever API
  - [ ] Jobs fetched from Ashby API
  - [ ] Jobs fetched from Indeed via Apify
  - [ ] Jobs fetched from LinkedIn via Apify
  - [ ] All normalized to canonical schema
  - [ ] Duplicates identified and merged
  - [ ] Job search returns filtered results

  **QA Scenarios**:

  \`\`\`
  Scenario: Job search returns aggregated results
    Tool: Bash
    Preconditions: API keys configured
    Steps:
      1. Call GET /api/jobs/search?keywords=software+engineer&location=Remote
      2. Verify results from multiple sources
      3. Verify canonical schema format
      4. Verify no duplicate jobs (same posting)
      5. Verify response includes source attribution
    Expected Result: Aggregated, deduplicated job results
    Failure Indicators: Missing sources, duplicates
    Evidence: .omo/evidence/task-12-search.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(jobs): add job feed aggregation across ATS platforms`
  - Files: `lib/job-aggregator/`, `app/api/jobs/`

- [ ] 13. Job search + matching engine

  **What to do**:
  - Implement semantic job matching (LLM-powered)
  - Implement skill gap analysis
  - Implement job-to-profile scoring
  - Create "best match" recommendations
  - Implement filter persistence (location, salary, etc.)
  - Build job alerts (email/push notifications)

  **Must NOT do**:
  - No matching based on demographic factors
  - No bias in job recommendations

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `nlp`]
  - `typescript`: Matching logic
  - `nlp`: Semantic similarity

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-12, 14, 15)
  - **Blocks**: Task 14, 15, 21
  - **Blocked By**: Task 9, 11

  **References**:
  - Semantic matching from `sentence-transformers`
  - Job matching patterns from `ai-job-agent`

  **Acceptance Criteria**:
  - [ ] Job matching returns relevance scores
  - [ ] Skill gaps identified and displayed
  - [ ] Match reasons explained (why this job matches)
  - [ ] Filters persist across sessions
  - [ ] Job alerts sent when matching jobs found

  **QA Scenarios**:

  \`\`\`
  Scenario: Job matching returns relevance scores
    Tool: Bash
    Preconditions: User profile complete, jobs in database
    Steps:
      1. Call GET /api/jobs/match?userId=123
      2. Verify each job has matchScore (0-100)
      3. Verify skill gaps identified
      4. Verify match reasons included
      5. Verify sorted by matchScore descending
    Expected Result: Matched jobs with scores
    Failure Indicators: No scores, wrong order
    Evidence: .omo/evidence/task-13-match.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(matching): add LLM-powered job matching engine`
  - Files: `lib/matching/`, `app/api/jobs/match/`

- [ ] 14. ATS optimization scoring engine

  **What to do**:
  - Implement keyword density analysis (target 2.3-3.1% primary)
  - Implement semantic relevance scoring
  - Implement format parseability checker
  - Implement recency weighting (last 2 years = 1.0)
  - Implement quantified achievement detection
  - Implement ATS score prediction (target 82-88)
  - Build suggestion engine for improvements
  - Add keyword stuffing warnings

  **Must NOT do**:
  - No targeting 100% score (looks suspicious)
  - No suggesting false achievements

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `nlp`]
  - `typescript`: Scoring algorithms
  - `nlp`: Text analysis

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-13, 15)
  - **Blocks**: Tasks 16, 17, 18
  - **Blocked By**: Task 4, 11, 12, 13

  **References**:
  - ATS scoring from `ajusta.ai/blog/ats-score-calculation-exposed`
  - Keyword density formulas
  - Semantic similarity from transformer models

  **Acceptance Criteria**:
  - [ ] Keyword density calculated per section
  - [ ] Format parseability scored (headers, dates, etc.)
  - [ ] Recency weighting applied to experience
  - [ ] Overall ATS score calculated (0-100)
  - [ ] Suggestions generated for improvement
  - [ ] Keyword stuffing flagged with warning

  **QA Scenarios**:

  \`\`\`
  Scenario: ATS score calculated correctly
    Tool: Bash
    Preconditions: Resume and job description
    Steps:
      1. Call POST /api/optimize/score with resume + job description
      2. Verify keyword density in range 2.3-3.1%
      3. Verify format parseability score
      4. Verify overall score between 0-100
      5. Verify suggestions array non-empty
      6. Verify no stuffing warning (density < 4.5%)
    Expected Result: ATS score with suggestions
    Failure Indicators: Score out of range, no suggestions
    Evidence: .omo/evidence/task-14-ats.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(ats): add ATS optimization scoring engine`
  - Files: `lib/ats-scorer/`, `app/api/optimize/`

- [ ] 15. AI agent orchestration (LangGraph)

  **What to do**:
  - Implement Scout agent (job discovery)
  - Implement Analyst agent (job scoring, ATS check)
  - Implement Writer agent (resume tailoring, cover letter)
  - Implement Applier agent (form filling, submission)
  - Implement Tracker agent (status tracking)
  - Implement Email Intel agent (interview/rejection detection)
  - Create agent state machine (Initiated → Analysis → Ready → InProgress → Complete)
  - Implement agent-to-agent communication
  - Add circuit breakers per agent type

  **Must NOT do**:
  - No agent operating without user consent
  - No submitting applications automatically without review (unless user enables)
  - No agent cascade failures (isolate failures)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `architecture`, `llm`]
  - `typescript`: LangGraph implementation
  - `architecture`: Multi-agent patterns
  - `llm`: Prompt engineering

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-14)
  - **Blocks**: Tasks 16, 17, 18
  - **Blocked By**: Task 4, 9, 11, 12, 13

  **References**:
  - `https://github.com/phoneixvenkat/ai-job-agent` - 6-agent LangGraph
  - `https://github.com/nickstenning/browser-use` - Agent browser patterns
  - `https://langchain-ai.github.io/langgraph/` - LangGraph docs

  **Acceptance Criteria**:
  - [ ] Scout agent discovers jobs matching profile
  - [ ] Analyst agent scores jobs against resume
  - [ ] Writer agent tailors resume for job
  - [ ] Applier agent fills forms on ATS
  - [ ] Tracker agent monitors application status
  - [ ] Email Intel detects interview/rejection
  - [ ] Agents communicate via shared state
  - [ ] Circuit breaker trips on repeated failures

  **QA Scenarios**:

  \`\`\`
  Scenario: Full agent pipeline processes job application
    Tool: Bash (bun test)
    Preconditions: User profile, job in database
    Steps:
      1. Call POST /api/agents/apply with jobId and userId
      2. Verify Scout finds job details
      3. Verify Analyst scores match
      4. Verify Writer tailors resume
      5. Verify Applier fills form
      6. Verify Tracker starts monitoring
      7. Verify state transitions: Initiated → Analysis → Ready → InProgress → Complete
    Expected Result: Full pipeline completes
    Failure Indicators: Pipeline stuck, wrong state
    Evidence: .omo/evidence/task-15-pipeline.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(agents): add LangGraph multi-agent orchestration`
  - Files: `lib/agents/`, `types/agent.ts`

---

- [ ] 16. Application automation + form filling

  **What to do**:
  - Implement Playwright-based form filling for each ATS type
  - Create Greenhouse form filling automation
  - Create Lever form filling automation
  - Create Ashby form filling automation
  - Implement dynamic field mapping (resume → form fields)
  - Implement captcha handling (hCaptcha, reCaptcha)
  - Implement assessment/quiz handling
  - Implement file upload handling

  **Must NOT do**:
  - No bypassing captcha entirely (must use solving service)
  - No storing credentials for ATS platforms
  - No aggressive form submission (respect rate limits)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`, `typescript`]
  - `playwright`: Form automation
  - `typescript`: Field mapping logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 17-21)
  - **Blocks**: Tasks 17, 18
  - **Blocked By**: Task 5, 6, 7, 14

  **References**:
  - `https://github.com/suhteevah/job-hunter-mcp` - Form filling patterns
  - Greenhouse/Lever/Ashby form structures

  **Acceptance Criteria**:
  - [ ] Greenhouse form filled correctly
  - [ ] Lever form filled correctly
  - [ ] Ashby form filled correctly
  - [ ] Resume fields mapped to form fields
  - [ ] Captcha detected and flagged for user
  - [ ] Assessment questions answered (if applicable)

  **QA Scenarios**:

  \`\`\`
  Scenario: Greenhouse application form filled
    Tool: Playwright
    Preconditions: User profile complete, worker running
    Steps:
      1. Start application process for sample Greenhouse job
      2. Verify browser navigates to job page
      3. Verify form fields filled from profile
      4. Verify resume uploaded
      5. Verify submission completes (or captcha blocks)
    Expected Result: Form filled correctly
    Failure Indicators: Wrong fields, missing data
    Evidence: .omo/evidence/task-16-greenhouse.mp4
  \`\`\`

  **Commit**: YES
  - Message: `feat(apply): add ATS form filling automation`
  - Files: `lib/automation/`, `workers/form-fillers/`

- [ ] 17. Session preservation for portals

  **What to do**:
  - Implement browser profile persistence (cookies, localStorage)
  - Implement session continuation (resume interrupted sessions)
  - Implement multi-step form state preservation
  - Create session recovery after errors
  - Implement session timeout handling
  - Add session invalidation when job closes

  **Must NOT do**:
  - No session sharing between users (each user has own session)
  - No storing sensitive data in session (credentials)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`, `typescript`]
  - `playwright`: Browser context management
  - `typescript`: Session state handling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 16, 18-21)
  - **Blocks**: Task 18
  - **Blocked By**: Task 5, 6, 7, 14

  **References**:
  - `https://github.com/nickstenning/browser-use` - Session patterns
  - Browser context from Playwright docs

  **Acceptance Criteria**:
  - [ ] Browser session persists across requests
  - [ ] Multi-step form state preserved
  - [ ] Session recovered after worker restart
  - [ ] Session timeout handled gracefully
  - [ ] Each user has isolated session

  **QA Scenarios**:

  \`\`\`
  Scenario: Session preserved across form steps
    Tool: Playwright
    Preconditions: User started application
    Steps:
      1. Fill step 1 of application
      2. Worker pauses (simulated delay)
      3. Worker resumes after 5 minutes
      4. Verify step 1 data preserved
      5. Continue filling step 2
      6. Verify no data loss
    Expected Result: Session state preserved
    Failure Indicators: Data lost, session reset
    Evidence: .omo/evidence/task-17-session.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(session): add browser session persistence`
  - Files: `lib/session/`, `workers/session-manager.ts`

- [ ] 18. Application tracking + status updates

  **What to do**:
  - Create application model and states (Applied, Under Review, Interview, Offer, Rejected)
  - Implement application creation on submission
  - Implement status polling (check application status)
  - Implement email-based status detection
  - Create application timeline view
  - Implement status notifications (email, push)
  - Build application analytics (response rate, time to response)

  **Must NOT do**:
  - No guaranteed status accuracy (ATS may not expose status)
  - No emailing users excessively (rate limit notifications)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `next.js`]
  - `typescript`: State management
  - `next.js`: Server actions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 16, 17, 19-21)
  - **Blocks**: Task 19, 20
  - **Blocked By**: Task 7, 14, 16, 17

  **References**:
  - Application state machine patterns
  - Email parsing for status detection

  **Acceptance Criteria**:
  - [ ] Application created on submission
  - [ ] Status updated from ATS polling
  - [ ] Status detected from email
  - [ ] Timeline shows all status changes
  - [ ] Notifications sent on status change
  - [ ] Analytics dashboard shows response rates

  **QA Scenarios**:

  \`\`\`
  Scenario: Application status updated from email
    Tool: Bash
    Preconditions: User has applied applications
    Steps:
      1. Call POST /api/webhooks/email with interview invite
      2. Verify application status updated to "Interview"
      3. Verify timeline entry added
      4. Verify notification sent to user
      5. Call GET /api/applications/123/timeline
      6. Verify timeline shows status change
    Expected Result: Status updated from email
    Failure Indicators: Status not updated, no notification
    Evidence: .omo/evidence/task-18-status.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(tracking): add application tracking and status updates`
  - Files: `lib/tracking/`, `app/api/applications/`, `app/(dashboard)/applications/`

- [ ] 19. Mobile-responsive dashboard UI

  **What to do**:
  - Implement mobile-first responsive layout
  - Create job search UI optimized for mobile
  - Create application tracking UI for mobile
  - Implement touch-friendly interactions
  - Create offline support (service worker)
  - Implement push notifications (web push)
  - Create mobile-specific navigation (bottom nav)

  **Must NOT do**:
  - No separate mobile site (same codebase, responsive)
  - No heavy animations on mobile (performance)
  - No landscape-only features

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`tailwindcss`, `react`]
  - `tailwindcss`: Responsive design
  - `react`: Component optimization

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 16-18, 20, 21)
  - **Blocks**: Task 21
  - **Blocked By**: Task 9, 18

  **References**:
  - Tailwind responsive utilities
  - Mobile-first patterns from `tailwindui`

  **Acceptance Criteria**:
  - [ ] Mobile layout works at 375px width
  - [ ] Tablet layout works at 768px width
  - [ ] Job search works on mobile
  - [ ] Application tracking works on mobile
  - [ ] Push notifications work on mobile
  - [ ] Service worker caches key pages

  **QA Scenarios**:

  \`\`\`
  Scenario: Mobile responsive job search
    Tool: Playwright (mobile emulation)
    Preconditions: Dev server running
    Steps:
      1. Navigate to / on iPhone SE (375x667)
      2. Verify job search bar visible
      3. Enter "software engineer" in search
      4. Tap search button
      5. Verify results load
      6. Scroll through results
      7. Verify no horizontal overflow
    Expected Result: Mobile search works
    Failure Indicators: Layout breaks, overflow
    Evidence: .omo/evidence/task-19-mobile.png
  \`\`\`

  **Commit**: YES
  - Message: `feat(ui): add mobile-responsive dashboard`
  - Files: `app/(dashboard)/`, `components/ui/`

- [ ] 20. REST API for mobile app

  **What to do**:
  - Create mobile-optimized API endpoints
  - Implement JWT authentication for mobile
  - Create token refresh flow
  - Implement push notification registration
  - Create lightweight response payloads (mobile-first)
  - Implement pagination optimized for mobile
  - Add API versioning (v1, v2)
  - Create API documentation (OpenAPI)

  **Must NOT do**:
  - No returning excessive data in mobile responses
  - No blocking API calls (async only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `api-design`]
  - `typescript`: Type-safe API
  - `api-design`: REST best practices

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 16-19, 21)
  - **Blocks**: None
  - **Blocked By**: Task 9, 18

  **References**:
  - BFF pattern from `https://nextjs.org/docs/app/guides/backend-for-frontend`
  - REST API best practices

  **Acceptance Criteria**:
  - [ ] GET /api/mobile/v1/jobs returns paginated jobs
  - [ ] GET /api/mobile/v1/applications returns user apps
  - [ ] POST /api/mobile/v1/auth/login returns JWT
  - [ ] Token refresh works
  - [ ] Push notification registration works
  - [ ] Response payloads are mobile-optimized

  **QA Scenarios**:

  \`\`\`
  Scenario: Mobile API returns optimized payload
    Tool: Bash
    Preconditions: API running
    Steps:
      1. Call GET /api/mobile/v1/jobs?page=1&limit=10
      2. Verify response < 50KB
      3. Verify only essential fields returned
      4. Verify pagination metadata included
      5. Call with invalid token
      6. Verify 401 returned
      7. Refresh token and retry
      8. Verify success
    Expected Result: Mobile-optimized API
    Failure Indicators: Large payloads, no pagination
    Evidence: .omo/evidence/task-20-api.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(api): add REST API for mobile app`
  - Files: `app/api/mobile/v1/`, `lib/api/`

- [ ] 21. Agent behavior presets + overrides

  **What to do**:
  - Create preset configurations (Conservative, Normal, Aggressive)
  - Implement per-user behavior settings
  - Create override system (user can override any setting)
  - Implement setting validation (prevent invalid combos)
  - Create behavior preview ("what would agent do")
  - Implement behavior testing mode

  **Must NOT do**:
  - No Aggressive mode bypassing rate limits
  - No settings that cause application errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `next.js`]
  - `typescript`: Settings validation
  - `next.js`: Settings UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 16-20)
  - **Blocks**: Task 22
  - **Blocked By**: Task 4, 9, 13, 15, 19

  **References**:
  - Settings validation patterns
  - Agent behavior from `ai-job-agent`

  **Acceptance Criteria**:
  - [ ] Conservative preset: 1 application/day, high review
  - [ ] Normal preset: 10 applications/day, medium review
  - [ ] Aggressive preset: 50 applications/day, low review
  - [ ] User can override any setting
  - [ ] Settings validated before save
  - [ ] Preview shows agent behavior

  **QA Scenarios**:

  \`\`\`
  Scenario: User overrides aggressive settings
    Tool: Playwright
    Preconditions: User with Aggressive preset
    Steps:
      1. Navigate to /settings/agent
      2. Change max daily applications to 5
      3. Enable review for all applications
      4. Save settings
      5. Verify warning shown about limits
      6. Verify new settings applied
      7. Start batch apply
      8. Verify respects 5/day limit
    Expected Result: Override works correctly
    Failure Indicators: Override not applied
    Evidence: .omo/evidence/task-21-override.html
  \`\`\`

  **Commit**: YES
  - Message: `feat(settings): add agent behavior presets and overrides`
  - Files: `app/(dashboard)/settings/agent/`, `lib/agent-settings/`

---

- [ ] 22. Team/collaborative features

  **What to do**:
  - Implement team creation and management
  - Implement member invitation (email, link)
  - Implement role-based permissions (owner, admin, member)
  - Implement shared job bookmarks
  - Implement shared application tracking
  - Implement team analytics (aggregate stats)
  - Implement activity feed (who applied to what)

  **Must NOT do**:
  - No team billing yet (B2C focus)
  - No admin panels for teams (self-service only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `next.js`]
  - `typescript`: Permission logic
  - `next.js`: Real-time UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 23-25)
  - **Blocks**: None
  - **Blocked By**: Task 18, 21

  **References**:
  - Team patterns from `linear` or `notion` collaboration
  - Real-time patterns with WebSocket

  **Acceptance Criteria**:
  - [ ] Team created with name
  - [ ] Members invited via email
  - [ ] Owner can set member roles
  - [ ] Shared bookmarks visible to team
  - [ ] Team analytics aggregated
  - [ ] Activity feed shows recent actions

  **QA Scenarios**:

  \`\`\`
  Scenario: Team member applies to shared job
    Tool: Playwright
    Preconditions: Team with 2 members, shared bookmark
    Steps:
      1. Member A creates team, adds bookmark
      2. Member B joins team
      3. Member B sees shared bookmark
      4. Member B applies to shared job
      5. Member A sees application in activity feed
      6. Verify application linked to team
    Expected Result: Team collaboration works
    Failure Indicators: Shared bookmark not visible
    Evidence: .omo/evidence/task-22-team.html
  \`\`\`

  **Commit**: YES
  - Message: `feat(team): add team collaboration features`
  - Files: `app/(dashboard)/team/`, `lib/team/`

- [ ] 23. Email intelligence agent

  **What to do**:
  - Implement email connection (Gmail, Outlook read-only)
  - Implement email parsing for application status
  - Implement interview invite detection
  - Implement rejection detection
  - Implement offer detection
  - Create email summary notifications
  - Implement unsubscribe/email stop

  **Must NOT do**:
  - No sending emails on behalf of user
  - No storing email content (only metadata)
  - No reading unrelated emails

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `nlp`]
  - `typescript`: Email parsing
  - `nlp`: Intent detection

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 22, 24, 25)
  - **Blocks**: None
  - **Blocked By**: Task 5, 14

  **References**:
  - Email parsing from `ai-job-agent` (Email Intel agent)
  - Gmail API integration patterns

  **Acceptance Criteria**:
  - [ ] Gmail connection established (read-only)
  - [ ] Outlook connection established (read-only)
  - [ ] Interview invite detected from email
  - [ ] Rejection detected from email
  - [ ] Offer detected from email
  - [ ] User notified of status changes

  **QA Scenarios**:

  \`\`\`
  Scenario: Interview invite detected from email
    Tool: Bash
    Preconditions: Gmail connected, mock email with interview
    Steps:
      1. Inject mock interview email into Gmail
      2. Run email intelligence check
      3. Verify interview status detected
      4. Verify application status updated
      5. Verify notification sent
    Expected Result: Interview detected
    Failure Indicators: Email not parsed
    Evidence: .omo/evidence/task-23-email.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(email): add email intelligence agent`
  - Files: `lib/email-intel/`, `app/api/email/`

- [ ] 24. Advanced proxy + anti-bot management

  **What to do**:
  - Implement residential proxy rotation
  - Implement proxy health monitoring
  - Implement fingerprint randomization (canvas, WebGL, fonts)
  - Implement human-like mouse movement
  - Implement human-like typing speed
  - Implement CAPTCHA detection and handling
  - Implement bot challenge response

  **Must NOT do**:
  - No circumventing security (just avoiding detection)
  - No illegal proxy services
  - No storing proxy credentials insecurely

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`, `architecture`]
  - `playwright`: Stealth configuration
  - `architecture`: Proxy management

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 22, 23, 25)
  - **Blocks**: None
  - **Blocked By**: Task 5, 6

  **References**:
  - Stealth from `clabs-ai/stealth` or `antcrawl/playwright-stealth`
  - Proxy rotation from `apify/proxy-checker`

  **Acceptance Criteria**:
  - [ ] Proxy rotation works across requests
  - [ ] Fingerprint randomization active
  - [ ] Mouse movement appears human
  - [ ] Typing speed varies naturally
  - [ ] CAPTCHA detected and flagged
  - [ ] Proxy health monitored and bad proxies removed

  **QA Scenarios**:

  \`\`\`
  Scenario: Bot detection avoided on target site
    Tool: Playwright
    Preconditions: Proxy pool configured, stealth enabled
    Steps:
      1. Navigate to target site with automation
      2. Wait 5 seconds
      3. Check for bot detection signals
      4. Verify no cloudflare/antibot challenge
      5. Verify fingerprint is randomized
      6. Navigate to second page
      7. Verify different fingerprint
    Expected Result: Bot detection avoided
    Failure Indicators: Challenge shown, fingerprint static
    Evidence: .omo/evidence/task-24-stealth.json
  \`\`\`

  **Commit**: YES
  - Message: `feat(proxy): add advanced proxy and anti-bot management`
  - Files: `lib/stealth/`, `lib/proxy/`

- [ ] 25. Comprehensive TDD tests

  **What to do**:
  - Write unit tests for all lib modules
  - Write integration tests for API routes
  - Write component tests for React UI
  - Write E2E tests for critical flows
  - Implement test coverage tracking
  - Set up CI/CD test pipeline
  - Implement test fixtures and factories

  **Must NOT do**:
  - No tests without assertions
  - No skipping tests in CI
  - No brittle tests (dependent on external services)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`testing`, `typescript`]
  - `testing`: Test patterns
  - `typescript`: Type-safe tests

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 22-24)
  - **Blocks**: F1
  - **Blocked By**: Task 1, 9, 14, 16, 17, 18

  **References**:
  - Bun test patterns
  - Vitest for React components
  - Playwright for E2E

  **Acceptance Criteria**:
  - [ ] All lib modules have unit tests
  - [ ] API routes have integration tests
  - [ ] UI components have tests
  - [ ] Critical flows have E2E tests
  - [ ] Coverage > 80%
  - [ ] CI pipeline runs all tests
  - [ ] All tests pass

  **QA Scenarios**:

  \`\`\`
  Scenario: Unit tests cover core lib modules
    Tool: Bash
    Preconditions: Test files written
    Steps:
      1. Run: bun test --coverage
      2. Verify coverage > 80%
      3. Verify all tests pass
      4. Verify no skipped tests
      5. Check coverage report
    Expected Result: Tests pass with good coverage
    Failure Indicators: Tests failing, low coverage
    Evidence: .omo/evidence/task-25-coverage.txt
  \`\`\`

  **Commit**: YES
  - Message: `test: add comprehensive TDD test suite`
  - Files: `**/*.test.ts`, `**/*.test.tsx`, `tests/`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .omo/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `bun tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.omo/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

### Per-Task Commits (Format: `type(scope): description`)
- **Wave 1 tasks**: Commits after each task completes with tests passing
- **Wave 2 tasks**: Commits after each task with integration tests
- **Wave 3 tasks**: Commits after integration with existing features
- **Wave 4 tasks**: Commits after full test suite passes

### Commit Types
- `feat(module)`: New feature implementation
- `fix(module)`: Bug fixes
- `test(module)`: Test additions
- `refactor(module)`: Code improvements
- `docs(module)`: Documentation
- `chore(infrastructure)`: Infrastructure changes

---

## Success Criteria

### Verification Commands
```bash
# Project scaffolding
bun tsc --noEmit  # TypeScript compiles
bun test          # All unit tests pass
bun dev           # Dev server starts

# Database
bun prisma migrate dev  # Migrations run
bun prisma generate     # Client generated

# Auth
curl -X POST http://localhost:3000/api/auth/register  # Auth works

# Queue
curl http://localhost:3000/api/queue/health  # Queue healthy

# Resume parsing
curl -X POST http://localhost:3000/api/resume/parse  # Parsing works

# Jobs
curl http://localhost:3000/api/jobs/search?q=software  # Job search works

# ATS scoring
curl -X POST http://localhost:3000/api/optimize/score  # ATS scoring works

# Worker
node worker-service.js  # Worker connects and registers
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass (bun test)
- [ ] TypeScript compiles (bun tsc --noEmit)
- [ ] Lint passes
- [ ] All evidence files captured
- [ ] Mobile-responsive verified
- [ ] Worker distributed mode verified
- [ ] TDD tests > 80% coverage
