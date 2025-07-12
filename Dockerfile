FROM node:20.11.1-alpine

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache python3 make g++

# Copie des fichiers de configuration
COPY package*.json ./

# Installation des dépendances avec une version spécifique de npm
RUN npm install -g npm@10.2.4 && \
    npm install --production

# Copie du code source
COPY src ./src

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Nettoyage
RUN apk del python3 make g++ && \
    rm -rf /var/cache/apk/*

# Démarrage de l'application
CMD ["node", "src/index.js"]
