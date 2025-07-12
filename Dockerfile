FROM node:22.10.0

WORKDIR /app

# Mise à jour de npm à la version 11.4.2
RUN npm install -g npm@11.4.2

# Installation des dépendances
COPY package*.json ./
RUN npm install --production --silent

# Copie du code source
COPY src ./src

# Configuration
ENV NODE_ENV=production

# Démarrage
CMD ["node", "src/index.js"]
