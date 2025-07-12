FROM node:20.11.1-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install --production --silent

# Copie du code source
COPY src ./src

# Configuration
ENV NODE_ENV=production

# Démarrage
CMD ["node", "src/index.js"]
