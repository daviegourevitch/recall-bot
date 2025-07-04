import { RecallDatabase } from '../services/recallDatabase';

describe('Recall Database', () => {
  let database: RecallDatabase;

  beforeEach(() => {
    database = new RecallDatabase();
  });

  describe('addRecallReason', () => {
    it('should add a new recall reason with count 1', () => {
      database.addRecallReason('Listeria Monocytogenes');
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 1 });
    });

    it('should increment count for existing recall reason', () => {
      database.addRecallReason('Listeria Monocytogenes');
      database.addRecallReason('Listeria Monocytogenes');
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({ reason: 'Listeria Monocytogenes', count: 2 });
    });

    it('should handle multiple different recall reasons', () => {
      database.addRecallReason('Listeria Monocytogenes');
      database.addRecallReason('Histamine');
      database.addRecallReason('Listeria Monocytogenes');
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(2);
      expect(stats).toContainEqual({ reason: 'Listeria Monocytogenes', count: 2 });
      expect(stats).toContainEqual({ reason: 'Histamine', count: 1 });
    });
  });

  describe('getRecallStats', () => {
    it('should return empty array when no recalls added', () => {
      const stats = database.getRecallStats();
      expect(stats).toEqual([]);
    });

    it('should return stats sorted by count in descending order', () => {
      database.addRecallReason('Histamine');
      database.addRecallReason('Histamine');
      database.addRecallReason('Histamine');
      database.addRecallReason('Listeria Monocytogenes');
      database.addRecallReason('Listeria Monocytogenes');
      database.addRecallReason('Peanuts');
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(3);
      expect(stats[0]).toEqual({ reason: 'Histamine', count: 3 });
      expect(stats[1]).toEqual({ reason: 'Listeria Monocytogenes', count: 2 });
      expect(stats[2]).toEqual({ reason: 'Peanuts', count: 1 });
    });

    it('should handle ties by maintaining insertion order', () => {
      database.addRecallReason('Histamine');
      database.addRecallReason('Listeria Monocytogenes');
      database.addRecallReason('Histamine');
      database.addRecallReason('Listeria Monocytogenes');
      
      const stats = database.getRecallStats();
      expect(stats).toHaveLength(2);
      expect(stats[0]).toEqual({ reason: 'Histamine', count: 2 });
      expect(stats[1]).toEqual({ reason: 'Listeria Monocytogenes', count: 2 });
    });
  });

  describe('clearDatabase', () => {
    it('should clear all recall data', () => {
      database.addRecallReason('Listeria Monocytogenes');
      database.addRecallReason('Histamine');
      
      database.clearDatabase();
      
      const stats = database.getRecallStats();
      expect(stats).toEqual([]);
    });
  });
}); 