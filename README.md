# Discord Bot Ultimate

A powerful, modular, and extensible Discord bot built with TypeScript, discord.js v14, and PostgreSQL.

## 🚀 Quick Start with Railway

1. Fork/Upload this repository to GitHub
2. Connect your GitHub repo to Railway
3. Add PostgreSQL from Railway's marketplace
4. Configure environment variables in Railway
5. Deploy!

## 📋 Required Environment Variables

- `DISCORD_TOKEN`: Your bot token from Discord Developer Portal
- `CLIENT_ID`: Your bot's application ID
- `TICKET_CATEGORY_ID`: Discord category ID for tickets
- `SUPPORT_ROLE_ID`: Discord role ID for support staff

Railway will automatically configure database variables when you add PostgreSQL.

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Run in development
npm run dev

# Build for production
npm run build

# Deploy slash commands
npm run deploy-commands

# Start production
npm start
```

## 📁 Project Structure

```
src/
├── commands/       # Slash commands organized by category
├── events/         # Discord.js event handlers
├── services/       # Business logic services
├── managers/       # System managers
├── database/       # Database models and migrations
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── config/         # Configuration management
```

## ✨ Features

- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **TypeScript**: Full type safety
- ✅ **PostgreSQL**: Robust data persistence with migrations
- ✅ **Professional Logging**: Winston logger with multiple transports
- ✅ **Error Handling**: Centralized error management
- ✅ **Environment Validation**: Type-safe configuration
- ✅ **Docker Support**: Ready for deployment
- ✅ **Testing Ready**: Jest configuration included

## 📝 Available Commands

- `/ping` - Check bot latency
- `/ticket open [reason]` - Open a support ticket
- `/ticket close` - Close the current ticket

## 🔧 Configuration

All configuration is done through environment variables. See `.env.example` for all available options.

## 📦 Dependencies

- **discord.js**: v14 - Discord API wrapper
- **TypeScript**: v5 - Type safety
- **PostgreSQL**: Database
- **Winston**: Logging
- **Zod**: Environment validation
- **Jest**: Testing

## 🐳 Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build manually
docker build -t discord-bot .
docker run -d --env-file .env discord-bot
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📊 Monitoring

The bot includes health checks at `/health` endpoint for monitoring.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this bot for your own projects!