# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Increase Node.js memory limit
ENV NODE_OPTIONS=--max_old_space_size=4096

# Build the app
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:stable-alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to Nginx's HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 8436
EXPOSE 8436

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
