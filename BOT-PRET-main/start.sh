#!/bin/sh

echo "Starting Discord Bot..."

# Run migrations
echo "Running database migrations..."
npm run db:migrate up || echo "Migration failed, continuing anyway..."

# Deploy commands if in production
if [ "$NODE_ENV" = "production" ]; then
    echo "Deploying Discord commands..."
    npm run deploy-commands || echo "Command deployment failed, continuing anyway..."
fi

# Start the bot
echo "Starting bot application..."
exec npm start
