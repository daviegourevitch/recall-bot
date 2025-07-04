import { Client, Events, GatewayIntentBits, TextChannel, ThreadChannel, Message, ChatInputCommandInteraction, SlashCommandBuilder, Interaction } from 'discord.js';
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
  private token: string;
  private trackedChannelId?: string;

  constructor(token: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.database = new RecallDatabase();
    this.token = token;
    this.setupEventHandlers();
  }

  /**
   * Sets up Discord event handlers
   */
  private setupEventHandlers(): void {
    this.client.on(Events.ClientReady, () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
      this.registerSlashCommands();
    });
    this.client.on(Events.InteractionCreate, this.handleInteraction.bind(this));
    this.client.on(Events.MessageCreate, this.handleMessage.bind(this));
  }

  /**
   * Registers slash commands with Discord
   */
  private async registerSlashCommands(): Promise<void> {
    try {
      const trackCommand = new SlashCommandBuilder()
        .setName('track')
        .setDescription('Set the channel to track for recall messages')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to track (defaults to current channel)')
            .setRequired(false)
        );

      const populateCommand = new SlashCommandBuilder()
        .setName('populate')
        .setDescription('Populate database with messages from a channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to populate from (defaults to current channel)')
            .setRequired(false)
        )
        .addIntegerOption(option =>
          option.setName('limit')
            .setDescription('Number of messages to fetch (defaults to 100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(1000)
        );

      await this.client.application?.commands.set([trackCommand, populateCommand]);
      console.log('Slash commands registered successfully');
    } catch (error) {
      console.error('Error registering slash commands:', error);
    }
  }

  /**
   * Handles Discord interactions (slash commands)
   * @param interaction - The Discord interaction
   */
  private async handleInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'track') {
      await this.handleTrackCommand(interaction);
    } else if (interaction.commandName === 'populate') {
      await this.handlePopulateCommand(interaction);
    }
  }

  /**
   * Handles the /track slash command
   * @param interaction - The slash command interaction
   */
  private async handleTrackCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const channel = interaction.options.getChannel('channel') as TextChannel | ThreadChannel | null;
      const targetChannel = channel || (interaction.channel as TextChannel | ThreadChannel | null);
      if (!targetChannel) {
        await interaction.reply({ content: '❌ Unable to determine the channel to track.', ephemeral: true });
        return;
      }
      this.trackedChannelId = targetChannel.id;
      await interaction.reply({
        content: `Now tracking channel: ${targetChannel.toString()}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error processing track command:', error);
      await interaction.reply({
        content: '❌ An error occurred while setting the tracked channel.',
        ephemeral: true,
      });
    }
  }

  /**
   * Handles the /populate slash command
   * @param interaction - The slash command interaction
   */
  private async handlePopulateCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const channel = interaction.options.getChannel('channel') as TextChannel | ThreadChannel | null;
      const targetChannel = channel || (interaction.channel as TextChannel | ThreadChannel | null);
      const limit = interaction.options.getInteger('limit') || 100;

      if (!targetChannel) {
        await interaction.reply({ content: '❌ Unable to determine the channel to populate from.', ephemeral: true });
        return;
      }

      // Send initial confirmation
      await interaction.reply({
        content: `🔄 Populating database with messages from ${targetChannel.toString()}...`,
        ephemeral: true,
      });

      // Fetch messages from the channel
      const messages = await targetChannel.messages.fetch({ limit });

      let processedCount = 0;
      let recallCount = 0;

      // Process each message
      for (const message of messages.values()) {
        // Skip bot messages
        if (message.author.bot) continue;

        // Check if this message has already been processed
        if (this.database.hasMessageBeenProcessed(message.id)) {
          continue; // Skip duplicate messages
        }

        processedCount++;

        // Check if this is a recall message
        if (isRecallMessage(message.content)) {
          try {
            // Extract and process the recall reason
            const rawReason = parseRecallReason(message.content);
            const titleCaseReason = toTitleCase(rawReason);
            // Add to database with message ID
            this.database.addRecallReason(titleCaseReason, message.id);
            recallCount++;
          } catch (error) {
            console.error('Error processing recall message:', error);
          }
        }
      }

      // Send follow-up with results
      await interaction.followUp({
        content: `✅ Database populated successfully!\n📊 Processed ${processedCount} messages, found ${recallCount} recall notices.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error('Error processing populate command:', error);
      await interaction.followUp({
        content: '❌ Error populating database. Please try again.',
        ephemeral: true,
      });
    }
  }

  /**
   * Handles incoming messages
   * @param message - The Discord message
   */
  private async handleMessage(message: Message): Promise<void> {
    // Ignore bot messages and messages from other channels/threads
    if (message.author.bot) return;
    if (!this.trackedChannelId || message.channelId !== this.trackedChannelId) return;
    
    // Check if this message has already been processed
    if (this.database.hasMessageBeenProcessed(message.id)) {
      return; // Skip duplicate messages
    }
    
    // Check if this is a recall message
    if (isRecallMessage(message.content)) {
      try {
        // Extract and process the recall reason
        const rawReason = parseRecallReason(message.content);
        const titleCaseReason = toTitleCase(rawReason);
        // Add to database with message ID
        this.database.addRecallReason(titleCaseReason, message.id);
        // Post updated statistics
        await this.postRecallStats(message.channel as TextChannel | ThreadChannel);
      } catch (error) {
        console.error('Error processing recall message:', error);
        // Don't mark message as processed if we failed to parse the recall reason
      }
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
      await this.client.login(this.token);
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