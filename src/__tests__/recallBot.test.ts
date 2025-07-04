/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecallBot } from '../services/recallBot';
import * as messageParser from '../utils/messageParser';
import * as textUtils from '../utils/textUtils';
import * as messageFormatter from '../utils/messageFormatter';

// Mock discord.js
jest.mock('discord.js', () => {
  class MockTextChannel {
    id: string;
    send = jest.fn();
    toString = jest.fn().mockReturnValue('#test-channel');
    constructor(id = 'test-channel-id') { this.id = id; }
  }
  class MockThreadChannel {
    id: string;
    send = jest.fn();
    toString = jest.fn().mockReturnValue('#test-thread');
    constructor(id = 'test-thread-id') { this.id = id; }
  }
  return {
    Client: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      login: jest.fn(),
      destroy: jest.fn(),
      application: {
        commands: {
          set: jest.fn(),
        },
      },
      user: { tag: 'RecallBot#0001' },
    })),
    Events: {
      ClientReady: 'ready',
      InteractionCreate: 'interactionCreate',
      MessageCreate: 'messageCreate',
    },
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 2,
      MessageContent: 4,
    },
    SlashCommandBuilder: jest.fn().mockImplementation(() => ({
      setName: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      addChannelOption: jest.fn().mockReturnThis(),
      addIntegerOption: jest.fn().mockReturnThis(),
    })),
    TextChannel: MockTextChannel,
    ThreadChannel: MockThreadChannel,
  };
});

// Mock the utility functions
jest.mock('../utils/messageParser', () => ({
  isRecallMessage: jest.fn(),
  parseRecallReason: jest.fn(),
}));

jest.mock('../utils/textUtils', () => ({
  toTitleCase: jest.fn(),
}));

jest.mock('../utils/messageFormatter', () => ({
  formatRecallStats: jest.fn(),
}));

describe('Recall Bot (tracked channel via slash command)', () => {
  let bot: RecallBot;
  let mockClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create bot instance
    bot = new RecallBot('mock-token');
    
    // Get references to mocked objects
    mockClient = (bot as any).client;
  });

  describe('Tracked channel management', () => {
    let mockInteraction: any;
    let mockChannel: any;
    beforeEach(() => {
      const discord = jest.requireMock('discord.js');
      mockChannel = new discord.TextChannel('tracked-channel-id');
      mockInteraction = {
        isChatInputCommand: jest.fn().mockReturnValue(true),
        commandName: 'track',
        options: {
          getChannel: jest.fn(),
        },
        reply: jest.fn(),
        channel: mockChannel,
      };
    });
    it('sets the tracked channel to the provided channel', async () => {
      const discord = jest.requireMock('discord.js');
      const providedChannel = new discord.TextChannel('provided-channel-id');
      mockInteraction.options.getChannel.mockReturnValue(providedChannel);
      // Simulate interaction
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);
      // The bot should reply with confirmation
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Now tracking channel: #test-channel',
        ephemeral: true,
      });
      // The bot should update its tracked channel
      expect((bot as any).trackedChannelId).toBe('provided-channel-id');
    });
    it('sets the tracked channel to the current channel if no channel is provided', async () => {
      mockInteraction.options.getChannel.mockReturnValue(null);
      // Simulate interaction
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Now tracking channel: #test-channel',
        ephemeral: true,
      });
      expect((bot as any).trackedChannelId).toBe('tracked-channel-id');
    });
    it('updates the tracked channel if called again', async () => {
      // Set once
      mockInteraction.options.getChannel.mockReturnValue(null);
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);
      // Set again to a different channel
      const discord = jest.requireMock('discord.js');
      const newChannel = new discord.TextChannel('new-channel-id');
      mockInteraction.options.getChannel.mockReturnValue(newChannel);
      await handler(mockInteraction);
      expect((bot as any).trackedChannelId).toBe('new-channel-id');
    });
  });

  describe('Recall message processing', () => {
    let mockMessage: any;
    beforeEach(() => {
      const discord = jest.requireMock('discord.js');
      mockMessage = {
        author: { bot: false },
        channelId: 'tracked-channel-id',
        content: '📰 | Product recalled due to Listeria',
        id: 'msg-1',
        channel: new discord.TextChannel('tracked-channel-id'),
      };
      (messageParser.isRecallMessage as jest.Mock).mockReturnValue(true);
      (messageParser.parseRecallReason as jest.Mock).mockReturnValue('Listeria');
      (textUtils.toTitleCase as jest.Mock).mockReturnValue('Listeria');
      (messageFormatter.formatRecallStats as jest.Mock).mockReturnValue('Stats!');
      // Set tracked channel
      (bot as any).trackedChannelId = 'tracked-channel-id';
    });
    it('processes recall messages in the tracked channel', async () => {
      // Simulate message event
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'messageCreate')[1];
      await handler(mockMessage);
      // Should add to database and post stats
      const db = (bot as any).database;
      expect(db.hasMessageBeenProcessed('msg-1')).toBe(true);
      expect(mockMessage.channel.send).toHaveBeenCalledWith('Stats!');
    });
    it('does not process recall messages in other channels', async () => {
      mockMessage.channelId = 'other-channel-id';
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'messageCreate')[1];
      await handler(mockMessage);
      const db = (bot as any).database;
      expect(db.hasMessageBeenProcessed('msg-1')).toBe(false);
      expect(mockMessage.channel.send).not.toHaveBeenCalled();
    });
    it('does not process non-recall messages', async () => {
      (messageParser.isRecallMessage as jest.Mock).mockReturnValue(false);
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'messageCreate')[1];
      await handler(mockMessage);
      const db = (bot as any).database;
      expect(db.hasMessageBeenProcessed('msg-1')).toBe(false);
      expect(mockMessage.channel.send).not.toHaveBeenCalled();
    });

    it('does not process bot messages', async () => {
      mockMessage.author.bot = true;
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'messageCreate')[1];
      await handler(mockMessage);
      const db = (bot as any).database;
      expect(db.hasMessageBeenProcessed('msg-1')).toBe(false);
      expect(mockMessage.channel.send).not.toHaveBeenCalled();
    });

    it('handles errors in recall message processing gracefully', async () => {
      (messageParser.parseRecallReason as jest.Mock).mockImplementation(() => {
        throw new Error('Parse error');
      });
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'messageCreate')[1];
      await handler(mockMessage);
      const db = (bot as any).database;
      // Message should not be marked as processed if parsing failed
      expect(db.hasMessageBeenProcessed('msg-1')).toBe(false);
      expect(mockMessage.channel.send).not.toHaveBeenCalled();
    });
  });

  describe('Bot Lifecycle', () => {
    it('should start the bot with correct token', async () => {
      await bot.start();
      expect(mockClient.login).toHaveBeenCalledWith('mock-token');
    });
    it('should stop the bot', () => {
      bot.stop();
      expect(mockClient.destroy).toHaveBeenCalled();
    });
  });

  describe('Database Operations', () => {
    it('should track recall statistics correctly', () => {
      const database = (bot as any).database;
      database.addRecallReason('Listeria', 'msg-1');
      database.addRecallReason('Histamine', 'msg-2');
      database.addRecallReason('Listeria', 'msg-3');
      const stats = bot.getRecallStats();
      expect(stats).toHaveLength(2);
      expect(stats[0]).toEqual({ reason: 'Listeria', count: 2 });
      expect(stats[1]).toEqual({ reason: 'Histamine', count: 1 });
    });
    it('should prevent duplicate message processing', () => {
      const database = (bot as any).database;
      database.addRecallReason('Listeria', 'msg-1');
      database.addRecallReason('Listeria', 'msg-1');
      const stats = bot.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria', count: 1 });
    });
    it('should clear all data when database is cleared', () => {
      const database = (bot as any).database;
      database.addRecallReason('Listeria', 'msg-1');
      database.addRecallReason('Histamine', 'msg-2');
      bot.clearDatabase();
      expect(database.hasMessageBeenProcessed('msg-1')).toBe(false);
      expect(database.hasMessageBeenProcessed('msg-2')).toBe(false);
      expect(bot.getRecallStats()).toEqual([]);
    });
  });

  describe('Populate command', () => {
    let mockInteraction: any;
    let mockChannel: any;
    let mockMessages: any[];

    beforeEach(() => {
      const discord = jest.requireMock('discord.js');
      mockChannel = new discord.TextChannel('populate-channel-id');
      
      // Create mock messages
      mockMessages = [
        {
          id: 'msg-1',
          content: '📰 | Product recalled due to Listeria',
          author: { bot: false },
        },
        {
          id: 'msg-2', 
          content: '📰 | Another product recalled due to Histamine',
          author: { bot: false },
        },
        {
          id: 'msg-3',
          content: 'Just a regular message',
          author: { bot: false },
        },
        {
          id: 'msg-4',
          content: '📰 | Third product recalled due to Listeria',
          author: { bot: false },
        },
      ];

      // Mock the messages.fetch method
      mockChannel.messages = {
        fetch: jest.fn().mockResolvedValue({
          values: () => mockMessages.values(),
          size: mockMessages.length,
        }),
      };

      mockInteraction = {
        isChatInputCommand: jest.fn().mockReturnValue(true),
        commandName: 'populate',
        options: {
          getChannel: jest.fn(),
          getInteger: jest.fn(),
        },
        reply: jest.fn(),
        channel: mockChannel,
        followUp: jest.fn(),
      };

      // Set up mocks for message processing
      (messageParser.isRecallMessage as jest.Mock).mockImplementation((content: string) => {
        return content.includes('recalled due to');
      });
      (messageParser.parseRecallReason as jest.Mock).mockImplementation((content: string) => {
        const match = content.match(/recalled due to\s+(.+)/i);
        return match ? match[1].trim() : '';
      });
      (textUtils.toTitleCase as jest.Mock).mockImplementation((text: string) => text);
      (messageFormatter.formatRecallStats as jest.Mock).mockReturnValue('Updated Stats!');
    });

    it('populates database with messages from specified channel', async () => {
      mockInteraction.options.getChannel.mockReturnValue(mockChannel);
      mockInteraction.options.getInteger.mockReturnValue(100);

      // Simulate interaction
      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);

      // Should reply with initial confirmation
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: '🔄 Populating database with messages from #test-channel...',
        ephemeral: true,
      });

      // Should fetch messages from the channel
      expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 100 });

      // Should process recall messages and add to database
      const db = (bot as any).database;
      expect(db.hasMessageBeenProcessed('msg-1')).toBe(true);
      expect(db.hasMessageBeenProcessed('msg-2')).toBe(true);
      expect(db.hasMessageBeenProcessed('msg-4')).toBe(true);
      expect(db.hasMessageBeenProcessed('msg-3')).toBe(false); // Not a recall message

      // Should send follow-up with results
      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: expect.stringContaining('✅ Database populated successfully!'),
        ephemeral: true,
      });
    });

    it('uses current channel when no channel is specified', async () => {
      mockInteraction.options.getChannel.mockReturnValue(null);
      mockInteraction.options.getInteger.mockReturnValue(50);

      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);

      expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 50 });
    });

    it('uses default limit of 100 when no limit is specified', async () => {
      mockInteraction.options.getChannel.mockReturnValue(mockChannel);
      mockInteraction.options.getInteger.mockReturnValue(null);

      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);

      expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 100 });
    });

    it('handles channels with no recall messages', async () => {
      const emptyMessages = [
        { id: 'msg-1', content: 'Just a regular message', author: { bot: false } },
        { id: 'msg-2', content: 'Another regular message', author: { bot: false } },
      ];

      mockChannel.messages.fetch.mockResolvedValue({
        values: () => emptyMessages.values(),
        size: emptyMessages.length,
      });

      mockInteraction.options.getChannel.mockReturnValue(mockChannel);
      mockInteraction.options.getInteger.mockReturnValue(100);

      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);

      // Should still complete successfully
      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: expect.stringContaining('✅ Database populated successfully!'),
        ephemeral: true,
      });
    });

    it('skips already processed messages', async () => {
      // Pre-process one message
      const db = (bot as any).database;
      db.addRecallReason('Listeria', 'msg-1');

      mockInteraction.options.getChannel.mockReturnValue(mockChannel);
      mockInteraction.options.getInteger.mockReturnValue(100);

      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);

      // Should still process other messages but not duplicate msg-1
      expect(db.hasMessageBeenProcessed('msg-2')).toBe(true);
      expect(db.hasMessageBeenProcessed('msg-4')).toBe(true);
    });

    it('handles errors during message fetching', async () => {
      mockChannel.messages.fetch.mockRejectedValue(new Error('Fetch failed'));
      mockInteraction.options.getChannel.mockReturnValue(mockChannel);
      mockInteraction.options.getInteger.mockReturnValue(100);

      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: expect.stringContaining('❌ Error populating database'),
        ephemeral: true,
      });
    });

    it('works with thread channels', async () => {
      const discord = jest.requireMock('discord.js');
      const mockThread = new discord.ThreadChannel('thread-id');
      mockThread.messages = {
        fetch: jest.fn().mockResolvedValue({
          values: () => mockMessages.values(),
          size: mockMessages.length,
        }),
      };

      mockInteraction.options.getChannel.mockReturnValue(mockThread);
      mockInteraction.options.getInteger.mockReturnValue(100);

      const handler = mockClient.on.mock.calls.find((c: any) => c[0] === 'interactionCreate')[1];
      await handler(mockInteraction);

      expect(mockThread.messages.fetch).toHaveBeenCalledWith({ limit: 100 });
    });
  });
}); 