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
  private processedMessageIds: Set<string> = new Set();

  /**
   * Adds a recall reason to the database or increments its count
   * @param reason - The recall reason to add
   * @param messageId - The ID of the message containing the recall
   */
  addRecallReason(reason: string, messageId: string): void {
    // Check if this message has already been processed
    if (this.processedMessageIds.has(messageId)) {
      return; // Skip duplicate messages
    }

    // Add message ID to processed set
    this.processedMessageIds.add(messageId);

    // Increment recall count
    const currentCount = this.recallCounts.get(reason) || 0;
    this.recallCounts.set(reason, currentCount + 1);
  }

  /**
   * Checks if a message has already been processed
   * @param messageId - The ID of the message to check
   * @returns True if the message has been processed
   */
  hasMessageBeenProcessed(messageId: string): boolean {
    return this.processedMessageIds.has(messageId);
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
   * Gets the set of processed message IDs
   * @returns Set of processed message IDs
   */
  getProcessedMessageIds(): Set<string> {
    return new Set(this.processedMessageIds);
  }

  /**
   * Clears all recall data
   */
  clearDatabase(): void {
    this.recallCounts.clear();
    this.processedMessageIds.clear();
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