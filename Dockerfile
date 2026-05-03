# Use official Node.js image
FROM node:18-slim

# Create and change to the app directory
WORKDIR /app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy local code to the container image
COPY . .

# Service listens on port 8080 by default in Cloud Run, 
# but our server uses process.env.PORT which Cloud Run provides.
EXPOSE 8080

# Run the web service on container startup
CMD ["node", "server.js"]
