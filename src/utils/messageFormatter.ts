/**
 * Formats recall statistics into a readable message
 * @param stats - Array of recall reasons with their counts
 * @returns Formatted message string
 */
export function formatRecallStats(stats: Array<{ reason: string; count: number }>): string {
  if (stats.length === 0) {
    return 'Top recall reasons:\nNo recalls recorded yet.';
  }
  
  const lines = ['Top recall reasons:'];
  
  stats.forEach((stat, index) => {
    lines.push(`${index + 1}. ${stat.reason} (${stat.count})`);
  });
  
  return lines.join('\n');
} 