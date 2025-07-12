FROM node:20.11.1-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm ci --only=production --silent --no-progress

# Copie du code source
COPY src ./src

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Démarrage de l'application
CMD ["node", "src/index.js"]
