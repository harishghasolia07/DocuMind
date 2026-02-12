'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/embeddings';
import { openai } from '@/lib/openai';

export interface QueryResult {
  success: boolean;
  answer?: string;
  sources?: Array<{
    documentName: string;
    chunkText: string;
    similarity: number;
  }>;
  error?: string;
}

/**
 * Answer a question using RAG (Retrieval-Augmented Generation)
 */
export async function askQuestion(
  question: string,
  documentId?: string
): Promise<QueryResult> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // Validate input
    if (!question || question.trim().length === 0) {
      return { success: false, error: 'Question cannot be empty' };
    }

    // Check if there are any documents for this user
    const documentCount = await prisma.document.count({ where: { userId } });
    if (documentCount === 0) {
      return {
        success: false,
        error: 'No documents uploaded yet. Please upload documents first.',
      };
    }

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);

    // Build the similarity search query
    const vectorString = `[${questionEmbedding.join(',')}]`;
    
    // Query for similar chunks using cosine distance
    let similarChunks;
    
    if (documentId) {
      // First verify document ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { userId: true },
      });

      if (!document || document.userId !== userId) {
        return { success: false, error: 'Document not found or unauthorized.' };
      }

      similarChunks = await prisma.$queryRaw<
        Array<{
          id: string;
          content: string;
          documentId: string;
          distance: number;
        }>
      >`
        SELECT 
          c.id,
          c.content,
          c."documentId",
          (c.embedding <=> ${vectorString}::vector) as distance
        FROM "Chunk" c
        WHERE c."documentId" = ${documentId}
        ORDER BY distance ASC
        LIMIT 5
      `;
    } else {
      // Search across all user's documents
      similarChunks = await prisma.$queryRaw<
        Array<{
          id: string;
          content: string;
          documentId: string;
          distance: number;
        }>
      >`
        SELECT 
          c.id,
          c.content,
          c."documentId",
          (c.embedding <=> ${vectorString}::vector) as distance
        FROM "Chunk" c
        INNER JOIN "Document" d ON c."documentId" = d.id
        WHERE d."userId" = ${userId}
        ORDER BY distance ASC
        LIMIT 5
      `;
    }

    if (similarChunks.length === 0) {
      return {
        success: false,
        error: 'No relevant content found in documents',
      };
    }

    // Get document names for the chunks
    const documentIds = [...new Set(similarChunks.map((c: { documentId: string }) => c.documentId))];
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      select: { id: true, name: true },
    });

    const documentMap = new Map(documents.map((d: { id: string; name: string }) => [d.id, d.name]));

    // Build context from retrieved chunks
    const context = similarChunks
      .map((chunk: { documentId: string; content: string }, index: number) => {
        const docName = documentMap.get(chunk.documentId) || 'Unknown';
        return `[Source ${index + 1}: ${docName}]\n${chunk.content}`;
      })
      .join('\n\n---\n\n');

    // Create the system prompt
    const systemPrompt = `You are a helpful assistant that answers questions based ONLY on the provided context from documents.

IMPORTANT RULES:
1. Answer ONLY using information from the provided context
2. If the answer is not found in the context, respond with "Not found in documents."
3. Cite which document(s) you used to answer the question
4. Be concise and accurate
5. Do not make up information or use external knowledge`;

    const userPrompt = `Context from documents:

${context}

---

Question: ${question}

Please answer the question based on the context above.`;

    // Call OpenAI to generate the answer
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || 'No answer generated';

    // Prepare sources with similarity scores
    const sources = similarChunks.map((chunk: any) => ({
      documentName: documentMap.get(chunk.documentId) || 'Unknown',
      chunkText: chunk.content,
      similarity: Math.round((1 - chunk.distance) * 100) / 100, // Convert distance to similarity
    }));

    return {
      success: true,
      answer,
      sources,
    };
  } catch (error) {
    console.error('Error answering question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to answer question',
    };
  }
}
