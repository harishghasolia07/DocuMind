'use server';

import { prisma } from '@/lib/prisma';

type PrismaChatSession = {
  id: string;
  title: string;
  messages: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type ChatSessionDelegate = {
  create: (...args: any[]) => Promise<PrismaChatSession>;
  update: (...args: any[]) => Promise<PrismaChatSession>;
  findMany: (...args: any[]) => Promise<PrismaChatSession[]>;
  findUnique: (...args: any[]) => Promise<PrismaChatSession | null>;
  delete: (...args: any[]) => Promise<void>;
};

function chatSessionClient(): ChatSessionDelegate {
  const client = (prisma as unknown as Record<string, unknown> & { chatSession?: ChatSessionDelegate }).chatSession;

  if (!client) {
    throw new Error('ChatSession model is unavailable on the Prisma client. Run `npx prisma generate` to refresh the client.');
  }

  return client;
}

export interface ChatMessage {
  question: string;
  answer: string;
  sources: Array<{
    documentName: string;
    chunkText: string;
    similarity: number;
  }>;
  timestamp: string;
}

export interface ChatSessionData {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Save or update a chat session
 */
export async function saveChatSession(
  title: string,
  messages: ChatMessage[],
  sessionId?: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    console.log('[saveChatSession] Called with:', { 
      title, 
      messageCount: messages.length, 
      sessionId,
      operation: sessionId ? 'update' : 'create'
    });
    
    let session;
    
    const client = chatSessionClient();

    if (sessionId) {
      // Update existing session
      console.log('[saveChatSession] Updating session:', sessionId);
      session = await client.update({
        where: { id: sessionId },
        data: {
          title,
          messages: JSON.stringify(messages),
        },
      });
    } else {
      // Create new session
      console.log('[saveChatSession] Creating new session');
      session = await client.create({
        data: {
          title,
          messages: JSON.stringify(messages),
        },
      });
    }

    console.log('[saveChatSession] Success:', session.id);
    
    return {
      success: true,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('[saveChatSession] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save chat session',
    };
  }
}

/**
 * Get all chat sessions (ordered by newest first)
 */
export async function getChatSessions(): Promise<ChatSessionData[]> {
  try {
    const sessions = await chatSessionClient().findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session: PrismaChatSession) => ({
      id: session.id,
      title: session.title,
      messages: JSON.parse(session.messages as string) as ChatMessage[],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
}

/**
 * Get a single chat session by ID
 */
export async function getChatSession(
  id: string
): Promise<ChatSessionData | null> {
  try {
    const session = await chatSessionClient().findUnique({
      where: { id },
    });

    if (!session) return null;

    return {
      id: session.id,
      title: session.title,
      messages: JSON.parse(session.messages as string) as ChatMessage[],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return null;
  }
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await chatSessionClient().delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return {
      success: false,
      error: 'Failed to delete chat session',
    };
  }
}
