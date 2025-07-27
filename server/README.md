# 1. Start database

docker-compose up -d

# 2. Setup database

cd server
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 3. Start servers

pnpm dev # Backend
cd ../frontend && pnpm dev # Frontend
