#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🤖 Recall Bot Setup');
console.log('==================\n');

const envPath = path.join(process.cwd(), '.env');
const examplePath = path.join(process.cwd(), 'env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('   If you need to update your Discord token, edit the .env file directly.\n');
  process.exit(0);
}

// Check if env.example exists
if (!fs.existsSync(examplePath)) {
  console.error('❌ env.example file not found');
  console.error('   Please make sure you have the env.example file in your project root.\n');
  process.exit(1);
}

// Read the example file
const exampleContent = fs.readFileSync(examplePath, 'utf8');

// Create .env file
try {
  fs.writeFileSync(envPath, exampleContent);
  console.log('✅ Created .env file from env.example');
  console.log('📝 Please edit the .env file and add your Discord bot token:');
  console.log('   DISCORD_TOKEN=your_actual_bot_token_here\n');
  console.log('💡 To get your Discord bot token:');
  console.log('   1. Go to https://discord.com/developers/applications');
  console.log('   2. Select your application');
  console.log('   3. Go to the "Bot" section');
  console.log('   4. Copy the token and paste it in your .env file\n');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  process.exit(1);
} 