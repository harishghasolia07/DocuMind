'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { chunkText } from '@/lib/chunking';
import { generateBatchEmbeddings } from '@/lib/embeddings';

export interface UploadResult {
  success: boolean;
  documentId?: string;
  documentName?: string;
  chunksCreated?: number;
  error?: string;
}

/**
 * Upload a document, chunk it, generate embeddings, and store in database
 */
export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const file = formData.get('file') as File;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!file.name.endsWith('.txt')) {
      return { success: false, error: 'Only .txt files are allowed' };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' };
    }

    // Read file content
    const content = await file.text();

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'File is empty' };
    }

    // Chunk the text
    const chunks = chunkText(content);

    if (chunks.length === 0) {
      return { success: false, error: 'Failed to chunk document' };
    }

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map((chunk) => chunk.content);
    const embeddings = await generateBatchEmbeddings(chunkTexts);

    // Store document and chunks in database using a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create document
      const document = await tx.document.create({
        data: {
          userId,
          name: file.name,
          content: content,
        },
      });

      // Use raw SQL for inserting chunks with vector embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embeddingArray = embeddings[i];
        
        // Format vector as pgvector string: [1.23,4.56,7.89]
        const vectorString = `[${embeddingArray.join(',')}]`;
        
        await tx.$executeRaw`
          INSERT INTO "Chunk" ("id", "documentId", "content", "embedding", "tokenCount", "chunkIndex", "createdAt")
          VALUES (gen_random_uuid()::text, ${document.id}, ${chunk.content}, ${vectorString}::vector, ${chunk.tokenCount}, ${i}, NOW())
        `;
      }

      return { document, chunkCount: chunks.length };
    });

    return {
      success: true,
      documentId: result.document.id,
      documentName: result.document.name,
      chunksCreated: result.chunkCount,
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload document',
    };
  }
}

/**
 * Delete a document and all its chunks
 */
export async function deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only delete if document belongs to user
    await prisma.document.delete({
      where: { 
        id: documentId,
        userId: userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      error: 'Failed to delete document',
    };
  }
}

/**
 * Get all documents for the authenticated user
 */
export async function getDocuments() {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}
