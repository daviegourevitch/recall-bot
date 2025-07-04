import { RecallDatabase } from '../services/recallDatabase';

describe('Recall Database', () => {
  let database: RecallDatabase;

  beforeEach(() => {
    database = new RecallDatabase();
  });

  describe('addRecallReason', () => {
    it('should add a new recall reason with count 1', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 1 });
    });

    it('should increment count for existing recall reason', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Listeria Monocytogenes', '987654321');
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 2 });
    });

    it('should handle multiple different recall reasons', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Histamine', '987654321');
      database.addRecallReason('Listeria Monocytogenes', '111222333');
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(2);
      expect(stats).toContainEqual({ reason: 'Listeria Monocytogenes', count: 2 });
      expect(stats).toContainEqual({ reason: 'Histamine', count: 1 });
    });
  });

  describe('hasMessageBeenProcessed', () => {
    it('should return false for new message IDs', () => {
      expect(database.hasMessageBeenProcessed('123456789')).toBe(false);
    });

    it('should return true for processed message IDs', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      expect(database.hasMessageBeenProcessed('123456789')).toBe(true);
    });

    it('should not count duplicate message IDs twice', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Listeria Monocytogenes', '123456789'); // Same message ID
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 1 });
    });

    it('should handle different reasons with same message ID', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Histamine', '123456789'); // Same message ID, different reason
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 1 });
    });
  });

  describe('getRecallStats', () => {
    it('should return empty array when no recalls added', () => {
      const stats = database.getRecallStats();
      expect(stats).toEqual([]);
    });

    it('should return stats sorted by count in descending order', () => {
      database.addRecallReason('Histamine', '111111111');
      database.addRecallReason('Histamine', '222222222');
      database.addRecallReason('Histamine', '333333333');
      database.addRecallReason('Listeria Monocytogenes', '444444444');
      database.addRecallReason('Listeria Monocytogenes', '555555555');
      database.addRecallReason('Peanuts', '666666666');
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(3);
      expect(stats[0]).toEqual({ reason: 'Histamine', count: 3 });
      expect(stats[1]).toEqual({ reason: 'Listeria Monocytogenes', count: 2 });
      expect(stats[2]).toEqual({ reason: 'Peanuts', count: 1 });
    });

    it('should handle ties by maintaining insertion order', () => {
      database.addRecallReason('Histamine', '111111111');
      database.addRecallReason('Listeria Monocytogenes', '222222222');
      database.addRecallReason('Histamine', '333333333');
      database.addRecallReason('Listeria Monocytogenes', '444444444');
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(2);
      expect(stats[0]).toEqual({ reason: 'Histamine', count: 2 });
      expect(stats[1]).toEqual({ reason: 'Listeria Monocytogenes', count: 2 });
    });
  });

  describe('clearDatabase', () => {
    it('should clear all recall data', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Histamine', '987654321');
      
      database.clearDatabase();
      
      const stats = database.getRecallStats();
      expect(stats).toEqual([]);
      expect(database.hasMessageBeenProcessed('123456789')).toBe(false);
      expect(database.hasMessageBeenProcessed('987654321')).toBe(false);
    });
  });

  describe('getProcessedMessageIds', () => {
    it('should return empty set when no messages processed', () => {
      const messageIds = database.getProcessedMessageIds();
      expect(messageIds).toEqual(new Set());
    });

    it('should return set of processed message IDs', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Histamine', '987654321');
      
      const messageIds = database.getProcessedMessageIds();
      expect(messageIds).toEqual(new Set(['123456789', '987654321']));
    });
  });

  describe('getTotalRecalls', () => {
    it('should return 0 when no recalls added', () => {
      expect(database.getTotalRecalls()).toBe(0);
    });

    it('should return correct total for single recall', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      expect(database.getTotalRecalls()).toBe(1);
    });

    it('should return correct total for multiple recalls', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Histamine', '987654321');
      database.addRecallReason('Listeria Monocytogenes', '111222333');
      expect(database.getTotalRecalls()).toBe(3);
    });

    it('should not count duplicate message IDs', () => {
      database.addRecallReason('Listeria Monocytogenes', '123456789');
      database.addRecallReason('Histamine', '123456789'); // Same message ID
      expect(database.getTotalRecalls()).toBe(1);
    });
  });
}); 