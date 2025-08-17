# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
pnpm dev          # Start development server (http://localhost:3000)
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm start        # Start production server
```

### Frontend API Architecture
The frontend uses a centralized API client pattern located in `frontend/lib/auth/`:

- **Base ApiClient** (`api.ts`): Core Axios-based client with interceptors for error handling, logging, and auth
- **Chat API** (`chat-api.ts`): Chat operations - send messages, get/clear history
- **Persona API** (`persona-api.ts`): CRUD operations for AI personas
- **System API** (`system-api.ts`): Health checks and system status

All API responses follow the standardized format:
```typescript
interface APIResponse<T> {
    success: boolean
    data?: T
    error?: string
}
```

The base client handles:
- Request/response interceptors with timing logs
- Centralized error handling (401, 429, timeouts)
- Standard response format normalization
- API base URL and timeout configuration

### Backend (Express.js)
```bash
cd server
pnpm dev          # Start development server with hot reload (http://localhost:5001)
pnpm build        # Compile TypeScript to JavaScript
pnpm start        # Start production server
pnpm test         # Run Jest tests
```

### Database (Prisma)
```bash
cd server
pnpm db:generate  # Generate Prisma client after schema changes
pnpm db:migrate   # Create and apply new migration
pnpm db:push      # Push schema changes without migration (dev only)
pnpm db:seed      # Seed database with default personas
pnpm db:studio    # Open Prisma Studio GUI
pnpm db:reset     # Reset database (destroys all data)
```

### Root Commands (from project root)
```bash
pnpm server       # Start backend dev server
pnpm frontend     # Start frontend dev server
```

### Docker
```bash
docker-compose up -d          # Start PostgreSQL and pgAdmin
docker-compose up -d postgres # Start only PostgreSQL
```

## Architecture Overview

This is a full-stack chat application with AI personas built using:

### Tech Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript, Prisma ORM, PostgreSQL
- **AI Integration**: LangChain with multiple LLM providers (OpenAI, Anthropic, Google, Mistral)

### Project Structure
- `frontend/` - Next.js application with React components and hooks
- `server/` - Express.js API server with layered architecture
- `docker-compose.yml` - PostgreSQL and pgAdmin services

### Backend Architecture
The server follows a clean layered architecture:
- `routes/` - Express route definitions
- `controllers/` - Request/response handling
- `services/` - Business logic and LLM integration
- `repositories/` - Database access layer using Prisma
- `middlewares/` - Error handling and validation
- `types/` - TypeScript type definitions
- `validations/` - Request validation schemas using Zod

### Database Schema
- **Users**: Future user management
- **Personas**: AI character definitions with system prompts
- **ChatSessions**: Individual conversation threads
- **Messages**: Chat messages with LLM metadata

### Key Features
- Multiple AI personas (Yoda, Steve Jobs, Grandma, custom)
- Support for OpenAI, Anthropic Claude, Google Gemini, Mistral AI
- Persistent chat history with PostgreSQL
- Real-time streaming responses
- Modern UI with dark/light theme support

## Development Workflow

1. **Environment Setup**: Copy `.env.example` files and configure API keys
2. **Database**: Start PostgreSQL with Docker, run migrations and seeding
3. **Development**: Run both frontend and backend in parallel
4. **Testing**: Use `pnpm test` in server directory

## Security Guidelines

### Frontend Security (from .cursor/rules/react-security.mdc)
- Never use `dangerouslySetInnerHTML` without sanitization
- Sanitize props before rendering user-generated content
- Use secure state management practices
- Implement proper authentication checks for protected routes
- Never store sensitive information in localStorage/sessionStorage

### Backend Security (from .cursor/rules/express-ts.mdc)
- Use TypeScript with strict mode
- Validate all inputs using Zod
- Use Helmet for HTTP headers
- Implement CORS properly
- Store sensitive data in environment variables
- Follow modular folder structure with proper separation of concerns

## Code Style Guidelines

### TypeScript
- Use strict TypeScript mode
- Avoid `any`, prefer `unknown` with type refinement
- Type all function inputs and outputs explicitly
- Store global types in respective `types/` directories

### API Design
- Use RESTful routes via `express.Router()`
- Delegate route logic to controllers
- Keep business logic in services
- Validate request bodies using Zod

## Environment Variables

Required for backend (server/.env):
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - Required for OpenAI models
- `ANTHROPIC_API_KEY` - Optional for Claude models
- `GOOGLE_API_KEY` - Optional for Gemini models
- `MISTRAL_API_KEY` - Optional for Mistral models
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5001)