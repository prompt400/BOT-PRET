FROM node:22.10.0

WORKDIR /app

# Mise à jour de npm à la version 11.4.2
RUN npm install -g npm@11.4.2

# Installation de tsx globalement
RUN npm install -g tsx

# Copie des fichiers de configuration
COPY package*.json tsconfig.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY src ./src

# Configuration de production
ENV NODE_ENV=production
ENV NODE_OPTIONS="--enable-source-maps"

# Utilisateur non-root pour la sécurité
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs
USER nodejs

# Démarrage avec tsx
CMD ["tsx", "src/index.ts"]
