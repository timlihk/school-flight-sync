FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev --no-fund --no-audit

FROM deps AS build
WORKDIR /app
COPY . .
# Build args for Vite - these are used at build time only
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AVIATION_API_KEY
ARG VITE_OPENSKY_CLIENT_ID
ARG VITE_OPENSKY_CLIENT_SECRET
ARG VITE_FAMILY_SECRET
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 4173
CMD ["npm", "run", "preview"]
