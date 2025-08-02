# -------- Build Stage --------
FROM node:20-alpine AS build

WORKDIR /app

# Copy only what's needed for install
COPY package*.json ./

# Install deps
RUN npm install

# Copy source code
COPY . .

# Build the Vite app
RUN npm run build

# -------- Serve Stage --------
FROM node:20-alpine AS serve

# Install `serve` globally to serve static files
RUN npm install -g serve

# Create app directory
WORKDIR /app

# Copy built files from previous stage
COPY --from=build /app/dist .

# Expose port (Vite preview default is 4173; use 80 for cloud deploys)
EXPOSE 5173

# Run app
CMD ["serve", "-s", ".", "-l", "5173"]
