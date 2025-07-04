import dotenv from 'dotenv';
import { RecallBot } from './services/recallBot';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'TARGET_CHANNEL_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create and start the bot
const bot = new RecallBot(
  process.env.DISCORD_TOKEN!,
  process.env.TARGET_CHANNEL_ID!
);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down bot...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down bot...');
  await bot.stop();
  process.exit(0);
});

// Start the bot
bot.start().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
}); 