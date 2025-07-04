import { toTitleCase } from '../utils/textUtils';

describe('Text Utils', () => {
  describe('toTitleCase', () => {
    it('should convert single word to title case', () => {
      expect(toTitleCase('histamine')).toBe('Histamine');
    });

    it('should convert multiple words to title case', () => {
      expect(toTitleCase('listeria monocytogenes')).toBe('Listeria Monocytogenes');
    });

    it('should handle already title cased text', () => {
      expect(toTitleCase('Listeria Monocytogenes')).toBe('Listeria Monocytogenes');
    });

    it('should handle mixed case text', () => {
      expect(toTitleCase('listeria MONOCYTOGENES')).toBe('Listeria Monocytogenes');
    });

    it('should handle text with special characters', () => {
      expect(toTitleCase('salmonella spp. contamination')).toBe('Salmonella Spp. Contamination');
    });

    it('should handle empty string', () => {
      expect(toTitleCase('')).toBe('');
    });

    it('should handle single character', () => {
      expect(toTitleCase('a')).toBe('A');
    });

    it('should handle text with numbers', () => {
      expect(toTitleCase('product 123 recall')).toBe('Product 123 Recall');
    });
  });
}); 