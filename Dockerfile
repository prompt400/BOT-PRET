FROM node:20.11.1-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production --silent --no-progress --no-fund --no-audit

COPY . .

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

CMD ["node", "index.js"]
