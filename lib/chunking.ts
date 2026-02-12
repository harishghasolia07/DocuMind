/**
 * Approximate token count using character-based estimation
 * OpenAI models typically use ~4 characters per token on average
 */
export function countTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Split text into chunks with overlap, respecting sentence boundaries
 * @param text - The text to chunk
 * @param minTokens - Minimum tokens per chunk (default: 500)
 * @param maxTokens - Maximum tokens per chunk (default: 800)
 * @param overlapTokens - Number of tokens to overlap between chunks (default: 100)
 * @returns Array of chunks with their content and token count
 */
export function chunkText(
  text: string,
  minTokens: number = 500,
  maxTokens: number = 800,
  overlapTokens: number = 100
): Array<{ content: string; tokenCount: number }> {
  // Split text into sentences (basic approach)
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  const chunks: Array<{ content: string; tokenCount: number }> = [];
  let currentChunk: string[] = [];
  let currentTokenCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceTokens = countTokens(sentence);

    // If adding this sentence would exceed maxTokens, finalize current chunk
    if (currentTokenCount + sentenceTokens > maxTokens && currentChunk.length > 0) {
      const chunkContent = currentChunk.join(' ');
      chunks.push({
        content: chunkContent,
        tokenCount: currentTokenCount,
      });

      // Create overlap by keeping last few sentences
      const overlapSentences: string[] = [];
      let overlapCount = 0;

      for (let j = currentChunk.length - 1; j >= 0; j--) {
        const prevSentence = currentChunk[j];
        const prevTokens = countTokens(prevSentence);

        if (overlapCount + prevTokens <= overlapTokens) {
          overlapSentences.unshift(prevSentence);
          overlapCount += prevTokens;
        } else {
          break;
        }
      }

      currentChunk = overlapSentences;
      currentTokenCount = overlapCount;
    }

    // Add current sentence to chunk
    currentChunk.push(sentence);
    currentTokenCount += sentenceTokens;

    // If we've reached minTokens and this is a good stopping point, we can continue
    // or finalize (but we'll continue to try to reach maxTokens)
  }

  // Add the last chunk if it exists
  if (currentChunk.length > 0) {
    const chunkContent = currentChunk.join(' ');
    chunks.push({
      content: chunkContent,
      tokenCount: currentTokenCount,
    });
  }

  return chunks;
}

