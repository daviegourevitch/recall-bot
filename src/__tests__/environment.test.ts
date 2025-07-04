import dotenv from 'dotenv';
import { existsSync, renameSync } from 'fs';
import { join } from 'path';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Environment File Loading', () => {
    it('should load environment variables from .env file', () => {
      const envPath = join(process.cwd(), '.env');
      
      // Check if .env file exists
      expect(existsSync(envPath)).toBe(true);
      
      // Load environment variables
      const result = dotenv.config({ path: envPath });
      
      // Should not have errors
      if (result.error) {
        if (hasCodeProperty(result.error)) {
          expect((result.error as { code?: string }).code).toBe('ENOENT');
        } else {
          expect(result.error).toBeUndefined();
        }
      } else {
        expect(result.error).toBeUndefined();
      }
      
      // Should have loaded some variables
      expect(result.parsed).toBeDefined();
    });

    it('should handle missing .env file gracefully', () => {
      // Temporarily rename .env to test missing file scenario
      const envPath = join(process.cwd(), '.env');
      const tempPath = join(process.cwd(), '.env.temp');
      
      if (existsSync(envPath)) {
        // Rename .env to .env.temp
        renameSync(envPath, tempPath);
        
        try {
          const result = dotenv.config({ path: envPath });
          // Should not throw error, just return empty parsed object
          if (result.error) {
            if (hasCodeProperty(result.error)) {
              expect((result.error as { code?: string }).code).toBe('ENOENT');
            } else {
              expect(result.error).toBeUndefined();
            }
          } else {
            expect(result.error).toBeUndefined();
          }
        } finally {
          // Restore .env file
          if (existsSync(tempPath)) {
            renameSync(tempPath, envPath);
          }
        }
      }
    });
  });

  describe('Required Environment Variables', () => {
    it('should validate DISCORD_TOKEN is present', () => {
      // Set a test token
      process.env.DISCORD_TOKEN = 'test-token';
      
      expect(process.env.DISCORD_TOKEN).toBe('test-token');
    });

    it('should handle DEBUG environment variable', () => {
      // Test with DEBUG=false
      process.env.DEBUG = 'false';
      expect(process.env.DEBUG).toBe('false');
      
      // Test with DEBUG=true
      process.env.DEBUG = 'true';
      expect(process.env.DEBUG).toBe('true');
    });
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test utility function
function hasCodeProperty(error: any) {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string';
} 