# Dockerfile optimisé pour bot Discord sur Railway
FROM node:18-alpine

# Installation des dépendances système
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances de production uniquement
RUN npm ci --only=production && \
    npm cache clean --force

# Copie du code source
COPY . .

# Exposition du port pour health check
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512 --enable-source-maps"

# Commande de démarrage avec launcher
CMD ["node", "start.js"]
