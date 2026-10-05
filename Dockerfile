FROM node:22-slim

WORKDIR /app

# Copy backend and frontend source
COPY backend ./backend
COPY frontend ./frontend

# Install PM2 globally to manage multiple processes
RUN npm install -g pm2

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --ignore-scripts && \
    rm -rf node_modules/sqlite3

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps && \
    chmod +x node_modules/.bin/*

# Go back to app root
WORKDIR /app

# Create PM2 ecosystem config file with delayed backend startup
RUN cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "backend-wait",
      script: "sh",
      args: "-c 'sleep 10 && exec node ./backend/server.js'",
      env: {
        NODE_ENV: "production",
        PORT: 7000,
        DB_DIALECT: "postgres",
        DB_HOST: "postgres"
      }
    },
    {
      name: "frontend",
      script: "sh",
      args: "-c 'cd /app/frontend && node_modules/.bin/vite --host 0.0.0.0 --port 3000'",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
EOF

# Expose both frontend and backend ports
EXPOSE 3000 7000

# Start both services using PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
