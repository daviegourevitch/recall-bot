import { Client, Events, GatewayIntentBits, TextChannel, ThreadChannel, Message } from 'discord.js';
import { RecallDatabase } from './recallDatabase';
import { isRecallMessage, parseRecallReason } from '../utils/messageParser';
import { toTitleCase } from '../utils/textUtils';
import { formatRecallStats } from '../utils/messageFormatter';

/**
 * Main Discord bot for tracking recall notices
 */
export class RecallBot {
  private client: Client;
  private database: RecallDatabase;
  private targetChannelId: string;

  constructor(token: string, targetChannelId: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    
    this.database = new RecallDatabase();
    this.targetChannelId = targetChannelId;
    
    this.setupEventHandlers();
  }

  /**
   * Sets up Discord event handlers
   */
  private setupEventHandlers(): void {
    this.client.on(Events.ClientReady, () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.on(Events.MessageCreate, this.handleMessage.bind(this));
  }

  /**
   * Handles incoming messages
   * @param message - The Discord message
   */
  private async handleMessage(message: Message): Promise<void> {
    // Ignore bot messages and messages from other channels/threads
    if (message.author.bot || message.channelId !== this.targetChannelId) {
      return;
    }

    try {
      // Check if this message has already been processed
      if (this.database.hasMessageBeenProcessed(message.id)) {
        return; // Skip duplicate messages
      }

      // Check if this is a recall message
      if (isRecallMessage(message.content)) {
        // Extract and process the recall reason
        const rawReason = parseRecallReason(message.content);
        const titleCaseReason = toTitleCase(rawReason);
        
        // Add to database with message ID
        this.database.addRecallReason(titleCaseReason, message.id);
        
        // Post updated statistics
        await this.postRecallStats(message.channel as TextChannel | ThreadChannel);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  /**
   * Posts recall statistics to the channel or thread
   * @param channel - The Discord text channel or thread to post to
   */
  private async postRecallStats(channel: TextChannel | ThreadChannel): Promise<void> {
    try {
      const stats = this.database.getRecallStats();
      const formattedStats = formatRecallStats(stats);
      
      await channel.send(formattedStats);
    } catch (error) {
      console.error('Error posting recall stats:', error);
    }
  }

  /**
   * Starts the bot
   */
  async start(): Promise<void> {
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('Error starting bot:', error);
      throw error;
    }
  }

  /**
   * Stops the bot
   */
  async stop(): Promise<void> {
    this.client.destroy();
  }

  /**
   * Gets the current recall statistics
   * @returns Array of recall statistics
   */
  getRecallStats() {
    return this.database.getRecallStats();
  }

  /**
   * Clears all recall data
   */
  clearDatabase(): void {
    this.database.clearDatabase();
  }
} 