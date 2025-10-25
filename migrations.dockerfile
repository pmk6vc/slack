FROM node:25-alpine AS migrations
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN HUSKY=0 npm ci

# Copy source (migrations directory must be present)
COPY . .
RUN ["rm", ".env"]

# Run migrations
ENTRYPOINT ["npm", "run", "migrate-up:docker"]
