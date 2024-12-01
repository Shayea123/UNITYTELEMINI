# Use Node.js 18 as the base image
FROM node:18.17.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .


# Start the Telegram bot with dynamic port support
CMD ["npm", "start"]
