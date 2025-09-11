# Base image
FROM node:18-alpine AS development

WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.8.0 --activate

# Copy package manifest(s)
COPY package.json pnpm-lock.yaml* ./

# Install app dependencies
RUN pnpm install --frozen-lockfile --prefer-offline || pnpm install

# Copy app source
COPY . .

# Build the app
RUN pnpm run build

# Production image
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Install pnpm in production image
RUN corepack enable && corepack prepare pnpm@8.8.0 --activate

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod --frozen-lockfile --prefer-offline || pnpm install --prod

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]