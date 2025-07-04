/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecallBot } from '../services/recallBot';

// Mock discord.js
jest.mock('discord.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    login: jest.fn(),
    destroy: jest.fn(),
  })),
  Events: {
    ClientReady: 'ready',
    MessageCreate: 'messageCreate',
  },
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    MessageContent: 4,
  },
}));

describe('Recall Bot', () => {
  let bot: RecallBot;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create bot instance
    bot = new RecallBot('mock-token', 'test-channel-id');
  });

  describe('Database Operations', () => {
    it('should track recall statistics correctly', () => {
      // Simulate adding recalls through the database directly
      const database = (bot as any).database;
      
      database.addRecallReason('Listeria Monocytogenes', 'msg-1');
      database.addRecallReason('Histamine', 'msg-2');
      database.addRecallReason('Listeria Monocytogenes', 'msg-3');
      
      const stats = bot.getRecallStats();
      expect(stats).toHaveLength(2);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 2 });
      expect(stats[1]).toEqual({ reason: 'Histamine', count: 1 });
    });

    it('should prevent duplicate message processing', () => {
      const database = (bot as any).database;
      
      // Add the same message twice
      database.addRecallReason('Listeria Monocytogenes', 'msg-1');
      database.addRecallReason('Listeria Monocytogenes', 'msg-1'); // Same message ID
      
      const stats = bot.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 1 });
    });

    it('should track processed message IDs', () => {
      const database = (bot as any).database;
      
      expect(database.hasMessageBeenProcessed('msg-1')).toBe(false);
      
      database.addRecallReason('Listeria Monocytogenes', 'msg-1');
      
      expect(database.hasMessageBeenProcessed('msg-1')).toBe(true);
      expect(database.hasMessageBeenProcessed('msg-2')).toBe(false);
    });

    it('should clear all data when database is cleared', () => {
      const database = (bot as any).database;
      
      database.addRecallReason('Listeria Monocytogenes', 'msg-1');
      database.addRecallReason('Histamine', 'msg-2');
      
      expect(database.hasMessageBeenProcessed('msg-1')).toBe(true);
      expect(database.hasMessageBeenProcessed('msg-2')).toBe(true);
      
      bot.clearDatabase();
      
      expect(database.hasMessageBeenProcessed('msg-1')).toBe(false);
      expect(database.hasMessageBeenProcessed('msg-2')).toBe(false);
      expect(bot.getRecallStats()).toEqual([]);
    });
  });
}); 