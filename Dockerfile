FROM node:22.10.0

WORKDIR /app

# Mise à jour de npm à la version 11.4.2
RUN npm install -g npm@11.4.2

# Copie des fichiers de configuration
COPY package*.json tsconfig.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY src ./src

# Build TypeScript
RUN npm run build

# Nettoyage des dépendances de développement
RUN npm ci --only=production

# Configuration
ENV NODE_ENV=production

# Démarrage
CMD ["node", "dist/index.js"]
