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

    it('should handle null input', () => {
      expect(toTitleCase(null as unknown as string)).toBe(null);
    });

    it('should handle undefined input', () => {
      expect(toTitleCase(undefined as unknown as string)).toBe(undefined);
    });

    it('should handle text with multiple spaces', () => {
      expect(toTitleCase('  multiple   spaces  ')).toBe('  Multiple   Spaces  ');
    });

    it('should handle text with punctuation', () => {
      expect(toTitleCase('listeria spp. contamination')).toBe('Listeria Spp. Contamination');
    });
  });
}); 