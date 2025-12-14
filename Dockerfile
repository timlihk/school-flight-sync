# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev --no-fund --no-audit

FROM deps AS build
COPY . .
# Load build-time env from a secret file if provided, without baking secrets into the image
RUN --mount=type=secret,id=env \
  if [ -f /run/secrets/env ]; then \
    set -a; . /run/secrets/env; set +a; \
  fi; \
  npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=4173
WORKDIR /app
COPY --from=deps /app/package*.json ./
RUN npm install --omit=dev --no-fund --no-audit
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD ["npm", "run", "preview"]
