# Recall Bot

A Discord bot that tracks recall notices and provides statistics on recall reasons.

## Features

- Monitors a specified Discord channel or thread for recall messages
- Automatically detects messages containing "recalled due to"
- Extracts and normalizes recall reasons (converts to title case)
- Maintains a local database of recall reasons and their frequencies
- Posts formatted statistics after each new recall is detected
- Sorts recall reasons by frequency (most common first)
- Prevents duplicate processing of the same message

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Discord Bot Token
- Target Discord Channel or Thread ID

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recall-bot
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Edit `.env` file with your Discord bot token and target channel/thread ID:
```
DISCORD_TOKEN=your_discord_bot_token_here
TARGET_CHANNEL_ID=your_target_channel_or_thread_id_here
```

### Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token and add it to your `.env` file
5. Enable the following bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History
   - Use Slash Commands (if using threads)
6. Invite the bot to your server with the appropriate permissions

### Thread Support

The bot supports both regular Discord channels and threads. When using a thread:
- The bot will monitor all messages in the thread
- Statistics will be posted in the same thread
- The bot can read and respond to messages in threads

## Usage

### Development Mode
```bash
yarn dev
```

### Production Mode
```bash
yarn build
yarn start
```

### Running Tests
```bash
yarn test
```

### Watch Mode for Tests
```bash
yarn test:watch
```

## Message Format

The bot expects recall messages in this format:
```
📰 | Product Name recalled due to Reason for Recall

https://example.com/recall-link
```

### Example Input
```
📰 | Peeters Mushroom Farm brand Sliced Mushrooms recalled due to Listeria monocytogenes

https://recalls-rappels.canada.ca/en/alert-recall/peeters-mushroom-farm-brand-sliced-mushrooms-recalled-due-listeria-monocytogenes
```

### Example Output
```
Top recall reasons:
1. Histamine (5)
2. Listeria Monocytogenes (3)
3. Peanuts (2)
4. Undeclared Milk (1)
```

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── services/
│   ├── recallBot.ts        # Main bot service
│   └── recallDatabase.ts   # Database management
├── utils/
│   ├── messageParser.ts    # Message parsing utilities
│   ├── messageFormatter.ts # Output formatting
│   └── textUtils.ts        # Text processing utilities
└── __tests__/              # Unit tests
```

## Testing

The project includes comprehensive unit tests for all major functionality:

- Message parsing and validation
- Text case conversion
- Database operations
- Message formatting
- Duplicate message prevention

Run tests with:
```bash
yarn test
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | Yes |
| `TARGET_CHANNEL_ID` | ID of the channel or thread to monitor | Yes |

## License

ISC 