import { Low } from 'lowdb';
import { join } from 'path';
import { JSONFile } from 'lowdb/node';

/**
 * Interface for recall statistics
 */
export interface RecallStat {
  reason: string;
  count: number;
}

interface RecallDatabaseSchema {
  recallCounts: Record<string, number>;
  processedMessageIds: string[];
}

/**
 * Service for managing recall reasons and their counts
 */
export class RecallDatabase {
  private db: Low<RecallDatabaseSchema>;
  private dbFilePath: string;

  constructor(dbFilePath = join(process.cwd(), 'recallDatabase.json')) {
    this.dbFilePath = dbFilePath;
    const adapter = new JSONFile<RecallDatabaseSchema>(this.dbFilePath);
    this.db = new Low(adapter, { recallCounts: {}, processedMessageIds: [] });
  }

  /**
   * Loads the database from file. Call this before using the database.
   */
  async load(): Promise<void> {
    await this.db.read();
    // Initialize if file is empty
    this.db.data ||= { recallCounts: {}, processedMessageIds: [] };
    await this.db.write();
  }

  /**
   * Adds a recall reason to the database or increments its count
   * @param reason - The recall reason to add
   * @param messageId - The ID of the message containing the recall
   */
  async addRecallReason(reason: string, messageId: string): Promise<void> {
    await this.load();
    if (this.db.data && this.db.data.processedMessageIds.includes(messageId)) {
      return;
    }
    this.db.data.processedMessageIds.push(messageId);
    this.db.data.recallCounts[reason] = (this.db.data.recallCounts[reason] || 0) + 1;
    await this.db.write();
  }

  /**
   * Checks if a message has already been processed
   * @param messageId - The ID of the message to check
   * @returns True if the message has been processed
   */
  async hasMessageBeenProcessed(messageId: string): Promise<boolean> {
    await this.load();
    return this.db.data && this.db.data.processedMessageIds.includes(messageId);
  }

  /**
   * Gets recall statistics sorted by count in descending order
   * @returns Array of recall statistics
   */
  async getRecallStats(): Promise<RecallStat[]> {
    await this.load();
    const stats = Object.entries(this.db.data.recallCounts).map(([reason, count]) => ({ reason, count: Number(count) }));
    return stats.sort((a, b) => b.count - a.count);
  }

  /**
   * Gets the set of processed message IDs
   * @returns Set of processed message IDs
   */
  async getProcessedMessageIds(): Promise<Set<string>> {
    await this.load();
    return new Set(this.db.data.processedMessageIds);
  }

  /**
   * Clears all recall data
   */
  async clearDatabase(): Promise<void> {
    await this.load();
    this.db.data = { recallCounts: {}, processedMessageIds: [] };
    await this.db.write();
  }

  /**
   * Gets the total number of recalls
   * @returns Total count of all recalls
   */
  async getTotalRecalls(): Promise<number> {
    await this.load();
    return (Object.values(this.db.data.recallCounts) as number[]).reduce((acc, count) => acc + count, 0);
  }
} 