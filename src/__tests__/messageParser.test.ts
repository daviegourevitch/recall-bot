import { parseRecallReason, isRecallMessage } from '../utils/messageParser';

describe('Message Parser', () => {
  describe('isRecallMessage', () => {
    it('should return true for messages containing "recalled due to"', () => {
      const message = '📰 | Peeters Mushroom Farm brand Sliced Mushrooms recalled due to Listeria monocytogenes';
      expect(isRecallMessage(message)).toBe(true);
    });

    it('should return false for messages without "recalled due to"', () => {
      const message = '📰 | Peeters Mushroom Farm brand Sliced Mushrooms is safe to eat';
      expect(isRecallMessage(message)).toBe(false);
    });

    it('should return false for empty messages', () => {
      expect(isRecallMessage('')).toBe(false);
    });

    it('should be case insensitive', () => {
      const message = '📰 | Product RECALLED DUE TO contamination';
      expect(isRecallMessage(message)).toBe(true);
    });
  });

  describe('parseRecallReason', () => {
    it('should extract the reason after "recalled due to"', () => {
      const message = '📰 | Peeters Mushroom Farm brand Sliced Mushrooms recalled due to Listeria monocytogenes';
      const reason = parseRecallReason(message);
      expect(reason).toBe('Listeria monocytogenes');
    });

    it('should handle multiple words in the reason', () => {
      const message = '📰 | Product recalled due to Undeclared Milk Allergen';
      const reason = parseRecallReason(message);
      expect(reason).toBe('Undeclared Milk Allergen');
    });

    it('should handle reasons with special characters', () => {
      const message = '📰 | Product recalled due to Salmonella spp. contamination';
      const reason = parseRecallReason(message);
      expect(reason).toBe('Salmonella spp. contamination');
    });

    it('should handle reasons at the end of the message', () => {
      const message = '📰 | Product recalled due to Histamine';
      const reason = parseRecallReason(message);
      expect(reason).toBe('Histamine');
    });

    it('should throw error for messages without recall reason', () => {
      const message = '📰 | Product is safe to eat';
      expect(() => parseRecallReason(message)).toThrow('No recall reason found in message');
    });

    it('should handle case insensitive matching', () => {
      const message = '📰 | Product RECALLED DUE TO contamination';
      const reason = parseRecallReason(message);
      expect(reason).toBe('contamination');
    });
  });
}); 