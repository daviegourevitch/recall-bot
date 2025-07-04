import dotenv from 'dotenv';
import { RecallBot } from './services/recallBot';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  console.log('Loading environment variables from .env file...');
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  No .env file found. Please create a .env file with your Discord bot token.');
  console.warn('   You can copy env.example to .env and fill in your values.');
  // Still try to load from default locations
  dotenv.config();
}

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN'];
const missingVars: string[] = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n📝 Please create a .env file with the following variables:');
  console.error('   DISCORD_TOKEN=your_discord_bot_token_here');
  console.error('\n💡 You can copy env.example to .env and fill in your values.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

// Create and start the bot
const bot = new RecallBot(process.env.DISCORD_TOKEN!);

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