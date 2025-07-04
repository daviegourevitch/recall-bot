import { formatRecallStats } from '../utils/messageFormatter';

describe('Message Formatter', () => {
  describe('formatRecallStats', () => {
    it('should format empty stats correctly', () => {
      const stats: Array<{ reason: string; count: number }> = [];
      const formatted = formatRecallStats(stats);
      expect(formatted).toBe('Top recall reasons:\nNo recalls recorded yet.');
    });

    it('should format single recall reason correctly', () => {
      const stats = [{ reason: 'Listeria Monocytogenes', count: 1 }];
      const formatted = formatRecallStats(stats);
      expect(formatted).toBe('Top recall reasons:\n1. Listeria Monocytogenes (1)');
    });

    it('should format multiple recall reasons correctly', () => {
      const stats = [
        { reason: 'Histamine', count: 5 },
        { reason: 'Listeria Monocytogenes', count: 3 },
        { reason: 'Peanuts', count: 2 },
        { reason: 'Undeclared Milk', count: 1 }
      ];
      const formatted = formatRecallStats(stats);
      const expected = `Top recall reasons:
1. Histamine (5)
2. Listeria Monocytogenes (3)
3. Peanuts (2)
4. Undeclared Milk (1)`;
      expect(formatted).toBe(expected);
    });

    it('should handle single digit counts', () => {
      const stats = [
        { reason: 'Histamine', count: 1 },
        { reason: 'Listeria Monocytogenes', count: 1 }
      ];
      const formatted = formatRecallStats(stats);
      const expected = `Top recall reasons:
1. Histamine (1)
2. Listeria Monocytogenes (1)`;
      expect(formatted).toBe(expected);
    });

    it('should handle large numbers', () => {
      const stats = [
        { reason: 'Histamine', count: 100 },
        { reason: 'Listeria Monocytogenes', count: 50 }
      ];
      const formatted = formatRecallStats(stats);
      const expected = `Top recall reasons:
1. Histamine (100)
2. Listeria Monocytogenes (50)`;
      expect(formatted).toBe(expected);
    });
  });
}); 