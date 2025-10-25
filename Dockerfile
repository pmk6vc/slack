FROM node:25-alpine AS builder
WORKDIR /app

# Install deps and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:25-alpine AS runtime
WORKDIR /app

# Port argument and exposure
ARG CHAT_SERVICE_PORT
ENV CHAT_SERVICE_PORT=${CHAT_SERVICE_PORT}
EXPOSE ${CHAT_SERVICE_PORT}

# Copy only runtime artifacts
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN HUSKY=0 npm ci --only=production

# Start the compiled app
ENTRYPOINT ["node", "."]