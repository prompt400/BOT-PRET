# 🤖 Ultimate Discord Bot

[![Discord.js](https://img.shields.io/badge/Discord.js-v14-7289da.svg)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![Railway](https://img.shields.io/badge/Deploy%20on-Railway-blueviolet)](https://railway.app/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A professional, feature-rich Discord bot built with TypeScript and Discord.js v14. Designed for scalability, reliability, and easy deployment on Railway.

## ✨ Features

### Core Features
- 🔒 **Type Safety** - Built with TypeScript for robust, error-free code
- 📁 **Modular Architecture** - Clean command and event structure
- 🗄️ **PostgreSQL Integration** - Professional database management with migrations
- ✅ **Environment Validation** - Zod-based environment variable validation
- 🛡️ **Error Handling** - Comprehensive error tracking with Sentry support
- 🚀 **Railway Ready** - Optimized for one-click deployment

### Bot Features
- 🎫 **Ticket System** - Full-featured support ticket management
- 👮 **Admin Commands** - Database status, statistics, and maintenance tools
- ⏱️ **Cooldown System** - Per-command cooldowns with database persistence
- 📊 **Logging** - Winston-based logging with daily rotation
- 🔄 **Auto-reconnect** - Automatic database reconnection on failures
- 💚 **Health Checks** - Built-in health endpoint for monitoring

## 📋 Prerequisites

- **Node.js** 18+ (v20 recommended)
- **PostgreSQL** database (Railway provides this automatically)
- **Discord Bot Token** ([Create one here](https://discord.com/developers/applications))
- **Railway Account** (optional, for deployment)

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/discord-bot-ultimate.git
cd discord-bot-ultimate
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database:**
```bash
# The bot will automatically run migrations on startup
# Or manually run:
npm run db:migrate
```

5. **Deploy slash commands:**
```bash
npm run deploy-commands
```

6. **Start the bot:**
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

### 🚄 Railway Deployment

1. **Click the Deploy button:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/ultimate-discord-bot)

2. **Configure environment variables in Railway:**
   - `DISCORD_TOKEN` - Your bot token
   - `CLIENT_ID` - Your bot's client ID
   - Database variables are auto-configured by Railway

3. **Deploy and enjoy!** 🎉

## 📁 Project Structure

```
├── src/
│   ├── commands/         # Command files organized by category
│   │   ├── admin/       # Admin-only commands
│   │   ├── general/     # General commands
│   │   └── tickets/     # Ticket system commands
│   ├── config/          # Configuration files
│   ├── events/          # Discord.js event handlers
│   ├── managers/        # Core managers (Database, Commands, Events)
│   ├── services/        # Business logic services
│   ├── structures/      # Bot client and structures
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── scripts/             # Utility scripts
├── tests/               # Test files
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|----------|
| `DISCORD_TOKEN` | Bot token from Discord | ✅ | - |
| `CLIENT_ID` | Bot's client ID | ✅ | - |
| `GUILD_ID` | Guild ID for guild commands | ❌ | - |
| `DATABASE_URL` | PostgreSQL connection string | ✅* | - |
| `NODE_ENV` | Environment mode | ❌ | `development` |
| `LOG_LEVEL` | Logging level | ❌ | `info` |
| `ENABLE_TICKETS` | Enable ticket system | ❌ | `true` |
| `SENTRY_DSN` | Sentry error tracking | ❌ | - |

*Either `DATABASE_URL` or individual PG variables required

## 📝 Available Commands

### General Commands
- `/ping` - Check bot latency and status

### Ticket Commands
- `/ticket create [reason]` - Create a support ticket
- `/ticket close [reason]` - Close current ticket
- `/ticket stats [user]` - View ticket statistics

### Admin Commands
- `/admin dbstatus` - Check database connection
- `/admin cleanup` - Clean inactive tickets
- `/admin reload <command>` - Reload a command
- `/admin stats` - View bot statistics

## 🔨 Development

### Adding New Commands

1. Create a new file in `src/commands/<category>/<command>.ts`
2. Use the command template:

```typescript
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/Command.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My awesome command'),
  
  category: 'general',
  cooldown: 3,
  
  async execute(interaction) {
    await interaction.reply('Hello World!');
  },
};

export default command;
```

### Database Migrations

```bash
# Create a new migration
npm run db:migrate:create -- my-migration-name

# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:migrate:down
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🐛 Troubleshooting

### Common Issues

**Bot not responding to commands:**
- Ensure slash commands are deployed: `npm run deploy-commands`
- Check bot has proper permissions in your server
- Verify `CLIENT_ID` and `GUILD_ID` are correct

**Database connection errors:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` or individual PG variables
- For Railway: Database is auto-provisioned

**Environment validation errors:**
- All required variables must be set
- Check `.env.example` for correct format
- Railway: Set variables in project settings

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - The Discord API wrapper
- [Railway](https://railway.app/) - Deployment platform
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [PostgreSQL](https://www.postgresql.org/) - Database

---

<p align="center">Made with ❤️ by <a href="https://github.com/yourusername">Your Name</a></p>
