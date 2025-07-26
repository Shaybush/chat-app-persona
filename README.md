# Chat Project - AI Persona Chat Application

A full-stack chat application with AI personas powered by multiple LLM providers, built with Next.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Multiple AI Personas**: Chat with different AI characters (Yoda, Steve Jobs, Grandma, or create custom ones)
- **Multiple LLM Support**: OpenAI GPT, Anthropic Claude, Google Gemini, and Mistral AI
- **Persistent Chat History**: Chat conversations stored in PostgreSQL database
- **Real-time Responses**: Streaming AI responses with conversation context
- **Custom Personas**: Create and manage your own AI personas
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🛠 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components

### Backend

- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe backend development
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM with migrations
- **LangChain** - AI/LLM integration framework

### Infrastructure

- **Docker** - Containerized development environment
- **pnpm** - Fast, efficient package manager

## 📦 Project Structure

```
chat-project/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and API client
│   └── types/               # TypeScript type definitions
├── server/                  # Express.js backend API
│   ├── src/
│   │   ├── config/          # Database and environment configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic layer
│   │   ├── repositories/    # Database access layer
│   │   ├── routes/          # API route definitions
│   │   ├── middlewares/     # Express middleware
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── seeds/           # Database seeding scripts
│   │   └── validations/     # Request validation schemas
│   └── prisma/              # Database schema and migrations
├── docker-compose.yml       # Docker services configuration
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Docker** and Docker Compose
- **API Keys** for AI providers (at least OpenAI)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd chat-project

# Install dependencies for both frontend and backend
pnpm install
cd frontend && pnpm install
cd ../server && pnpm install
```

### 2. Environment Setup

Create environment files:

```bash
# Backend environment
cp server/.env.example server/.env

# Frontend environment (if needed)
cp frontend/.env.example frontend/.env
```

Edit `server/.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chat_project"

# Server Configuration
NODE_ENV=development
PORT=5001

# API Keys (add your actual keys)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GOOGLE_API_KEY=your-google-api-key-here
MISTRAL_API_KEY=your-mistral-api-key-here
```

### 3. Database Setup

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Generate Prisma client
cd server
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database with default personas
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend server
cd server
pnpm dev

# Terminal 2: Start frontend development server
cd frontend
pnpm dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **pgAdmin** (Database GUI): http://localhost:5050
  - Email: `admin@chat.com`
  - Password: `admin`

## 🗄 Database Management

### Common Commands

```bash
cd server

# Generate Prisma client after schema changes
pnpm db:generate

# Create and apply a new migration
pnpm db:migrate

# Push schema changes without migration (development)
pnpm db:push

# Seed the database
pnpm db:seed

# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database (⚠️ destroys all data)
pnpm db:reset
```

### Database Schema

The application uses the following main entities:

- **Users**: Future user management
- **Personas**: AI character definitions
- **Chat Sessions**: Individual conversation threads
- **Messages**: Individual chat messages

## 🤖 AI Providers Configuration

### OpenAI (Required)

```env
OPENAI_API_KEY=sk-...
```

Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

### Anthropic Claude (Optional)

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Models: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-opus-20240229`

### Google Gemini (Optional)

```env
GOOGLE_API_KEY=AI...
```

Models: `gemini-1.5-pro`, `gemini-1.5-flash`

### Mistral AI (Optional)

```env
MISTRAL_API_KEY=...
```

Models: `mistral-large-latest`, `mistral-small-latest`

## 🐳 Docker Development

### Start all services:

```bash
docker-compose up -d
```

### Individual services:

```bash
# Database only
docker-compose up -d postgres

# Database + pgAdmin
docker-compose up -d postgres pgadmin
```

### View logs:

```bash
docker-compose logs -f postgres
```

## 📁 API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Personas

- `GET /api/personas` - Get all personas
- `POST /api/personas` - Create new persona
- `PUT /api/personas/:id` - Update persona
- `DELETE /api/personas/:id` - Delete persona

### Chat

- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/history/:personaId` - Get chat history
- `DELETE /api/chat/history/:personaId` - Clear chat history

## 🧪 Testing

```bash
# Backend tests
cd server
pnpm test

# Frontend tests
cd frontend
pnpm test
```

## 🚀 Production Deployment

### Build the application:

```bash
# Build backend
cd server
pnpm build

# Build frontend
cd frontend
pnpm build
```

### Environment considerations:

- Set `NODE_ENV=production`
- Use production database URL
- Configure proper CORS origins
- Set up proper logging
- Use environment variables for all secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Database Connection Issues

1. Ensure Docker is running
2. Check if PostgreSQL container is running: `docker-compose ps`
3. Verify DATABASE_URL in `.env` file
4. Try resetting the database: `pnpm db:reset`

### API Key Issues

1. Ensure at least OPENAI_API_KEY is set
2. Check API key formats and permissions
3. Verify API quotas and billing

### Port Conflicts

- Backend (5001): Change `PORT` in `server/.env`
- Frontend (3000): Use `pnpm dev -- -p <PORT>`
- PostgreSQL (5432): Change port in `docker-compose.yml`
- pgAdmin (5050): Change port in `docker-compose.yml`

For more help, please open an issue in the repository.
