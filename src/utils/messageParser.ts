/**
 * Checks if a message contains a recall notice
 * @param message - The message to check
 * @returns True if the message contains a recall notice
 */
export function isRecallMessage(message: string): boolean {
  if (!message) return false;
  
  const recallPattern = /recalled due to/i;
  return recallPattern.test(message);
}

/**
 * Extracts the recall reason from a message
 * @param message - The message containing the recall notice
 * @returns The recall reason
 * @throws Error if no recall reason is found
 */
export function parseRecallReason(message: string): string {
  if (!isRecallMessage(message)) {
    throw new Error('No recall reason found in message');
  }
  
  const recallPattern = /recalled due to\s+(.+)/i;
  const match = message.match(recallPattern);
  
  if (!match || !match[1]) {
    throw new Error('No recall reason found in message');
  }
  
  return match[1].trim();
} 