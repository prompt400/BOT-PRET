FROM node:22.10.0

WORKDIR /app

# Mise à jour de npm à la version 11.4.2
RUN npm install -g npm@11.4.2

# Copie des fichiers de configuration
COPY package*.json tsconfig.json ./

# Installation des dépendances
RUN npm ci

# Build TypeScript
COPY src ./src
RUN npm run build

# Nettoyage
RUN rm -rf src/
RUN npm ci --only=production

# Configuration de production
ENV NODE_ENV=production

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Démarrage
CMD ["node", "dist/index.js"]
