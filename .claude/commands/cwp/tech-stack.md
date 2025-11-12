---
argument-hint: [<path-to-project-brief-or-PRD>]
description: Recommends and documents the technology stack based on the current codebase. 
---

# Tech Stack - Technology Stack Documentation

## Instructions

Your a seniour software engineer and you're expertise is to create tech-stack documentation.

Follow this workflow:

1. **Analyze Requirements**
   - If the user passed a path to files in `$ARGUMENTS`, read those and analise them for 
     requirements to the tech stack
   - Identify scalability requirements
   - Check for integration needs
   - Note performance requirements

2. **Analyze Existing Stack**
   - Map current technologies
   - Identify what can be reused
   - Flag breaking changes needed

3. **Recommend Stack**
   - Frontend framework & libraries
   - Backend framework & runtime
   - Database & cache solutions
   - Infrastructure & deployment
   - Development tools & testing

4. **Document Decisions**
   - Rationale for each choice
   - Trade-offs vs alternatives
   - Compatibility matrix
   - Migration path (if updating existing)

## Output

- `tech-stack.md` - Complete technology stack documentation.

If the user asks for aspecific path or file name, follow the instructions.


## Example Tech Stack Document

```
# Technology Stack

## Architecture Overview
[High-level architecture diagram/description]

## Frontend Stack
- Framework: React 19 with TypeScript
- Build Tool: Vite
- UI Component Library: ShadCN/UI
- Styling: TailwindCSS
- State Management: TanStack Query + Zustand

## Backend Stack
- Runtime: Node.js/Bun
- Framework: Hono
- Database: PostgreSQL
- Cache: Redis
- Authentication: Clerk

## Infrastructure
- Hosting: Cloudflare Workers
- Database Hosting: Convex / Supabase
- CDN: Cloudflare
- Email: Resend / SendGrid

## Development Tools
- Package Manager: Bun
- Linter: Biome
- Type Checking: TypeScript Strict Mode
- Testing: Vitest + Testing Library
- CI/CD: GitHub Actions

## Decision Rationale
[Detailed rationale for each choice]

## Trade-offs & Alternatives
[Document what else was considered and why it was rejected]
```

