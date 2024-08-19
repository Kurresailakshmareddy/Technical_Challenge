# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY src/ /app

# Install the http-server package globally
RUN npm install -g http-server

# Expose port 8080 to the outside world
EXPOSE 8080

# Start the HTTP server on port 8080
CMD ["http-server", "-p", "8080"]
