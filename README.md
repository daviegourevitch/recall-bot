# Recall Bot

A Discord bot that tracks recall notices and provides statistics on recall reasons using slash commands.

## Features

- Uses slash commands to process recall messages from anywhere in the server
- Automatically detects messages containing "recalled due to"
- Extracts and normalizes recall reasons (converts to title case)
- Maintains a local database of recall reasons and their frequencies
- Posts formatted statistics after each new recall is processed
- Sorts recall reasons by frequency (most common first)
- Prevents duplicate processing of the same recall message
- Optional channel parameter to specify where statistics should be posted

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Discord Bot Token

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

4. Edit `.env` file with your Discord bot token:
```
DISCORD_TOKEN=your_discord_bot_token_here
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
   - Use Slash Commands
6. Invite the bot to your server with the appropriate permissions

## Usage

### Slash Commands

The bot provides a `/recall` slash command with the following parameters:

- **message** (required): The recall message to process
- **channel** (optional): Channel to post statistics to (defaults to current channel)

### Example Usage

#### Basic Usage (posts stats to current channel)
```
/recall message:"📰 | Peeters Mushroom Farm brand Sliced Mushrooms recalled due to Listeria monocytogenes"
```

#### With Specific Channel (posts stats to designated channel)
```
/recall message:"📰 | Product recalled due to Reason" channel:#recall-stats
```

#### Processing Multiple Recalls
```
/recall message:"📰 | Brand A recalled due to Salmonella"
/recall message:"📰 | Brand B recalled due to Undeclared Milk"
/recall message:"📰 | Brand C recalled due to Salmonella"
```

After processing these, the bot will show:
```
Top recall reasons:
1. Salmonella (2)
2. Undeclared Milk (1)
```

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
│   ├── recallBot.ts        # Main bot service with slash commands
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

## License

ISC 