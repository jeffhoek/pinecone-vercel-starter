/**
 * Preprocesses a user query to improve embedding similarity with documents
 * by removing common question words and normalizing the text.
 *
 * @param query - The original user query
 * @returns Preprocessed query optimized for semantic search
 */
export function preprocessQuery(query: string): string {
  // Common question words that add noise to embeddings
  const questionWords = [
    'jaco', 'Jaco',
    'does', 'do', 'did',
    'is', 'are', 'was', 'were', 'been', 'being',
    'has', 'have', 'had',
    'can', 'could',
    'would', 'should',
    'will', 'shall',
    'what', 'when', 'where', 'who', 'whom', 'whose', 'why', 'how',
    'which',
    'may', 'might', 'must',
    'a', 'an', 'the',
    'any', 'some',
  ];

  // Convert to lowercase for case-insensitive matching
  let processed = query.toLowerCase();

  // Remove question words (word boundary matching to avoid partial matches)
  questionWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    processed = processed.replace(regex, '');
  });

  // Remove question marks and other punctuation that doesn't add meaning
  processed = processed.replace(/[?!.,"';:]/g, '');

  // Clean up extra whitespace
  processed = processed.trim().replace(/\s+/g, ' ');

  // If preprocessing resulted in empty string, return original query
  if (!processed || processed.length === 0) {
    return query;
  }

  console.log(`Query preprocessing: "${query}" -> "${processed}"`);

  return processed;
}

/**
 * Example usage:
 *
 * preprocessQuery("Does Jaco have any health concerns?")
 * // Returns: "jaco health concerns"
 *
 * preprocessQuery("What are Jaco's favorite activities?")
 * // Returns: "jaco's favorite activities"
 *
 * preprocessQuery("health concerns?")
 * // Returns: "health concerns"
 */
