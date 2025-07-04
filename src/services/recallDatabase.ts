/**
 * Interface for recall statistics
 */
export interface RecallStat {
  reason: string;
  count: number;
}

/**
 * Service for managing recall reasons and their counts
 */
export class RecallDatabase {
  private recallCounts: Map<string, number> = new Map();

  /**
   * Adds a recall reason to the database or increments its count
   * @param reason - The recall reason to add
   */
  addRecallReason(reason: string): void {
    const currentCount = this.recallCounts.get(reason) || 0;
    this.recallCounts.set(reason, currentCount + 1);
  }

  /**
   * Gets recall statistics sorted by count in descending order
   * @returns Array of recall statistics
   */
  getRecallStats(): RecallStat[] {
    const stats: RecallStat[] = [];
    
    for (const [reason, count] of this.recallCounts.entries()) {
      stats.push({ reason, count });
    }
    
    // Sort by count in descending order
    return stats.sort((a, b) => b.count - a.count);
  }

  /**
   * Clears all recall data
   */
  clearDatabase(): void {
    this.recallCounts.clear();
  }

  /**
   * Gets the total number of recalls
   * @returns Total count of all recalls
   */
  getTotalRecalls(): number {
    let total = 0;
    for (const count of this.recallCounts.values()) {
      total += count;
    }
    return total;
  }
} 