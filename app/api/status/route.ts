import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

interface StatusCheck {
  status: 'ok' | 'error';
  message?: string;
  details?: any;
}

interface HealthStatus {
  database: StatusCheck;
  llm: StatusCheck;
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

export async function GET() {
  const status: HealthStatus = {
    database: { status: 'error' },
    llm: { status: 'error' },
    timestamp: new Date().toISOString(),
    overall: 'unhealthy',
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if pgvector extension is enabled
    const vectorCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as exists
    `;
    
    const hasVector = vectorCheck[0]?.exists;
    
    status.database = {
      status: 'ok',
      details: {
        connected: true,
        pgvectorEnabled: hasVector,
      },
    };
    
    if (!hasVector) {
      status.database.message = 'Warning: pgvector extension not enabled';
    }
  } catch (error) {
    status.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }

  // Check OpenAI LLM connection
  try {
    // Test with a simple embedding call (faster than completion)
    const testResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test',
    });

    if (testResponse.data && testResponse.data.length > 0) {
      status.llm = {
        status: 'ok',
        details: {
          model: 'text-embedding-3-small',
          connected: true,
        },
      };
    }
  } catch (error) {
    status.llm = {
      status: 'error',
      message: error instanceof Error ? error.message : 'OpenAI connection failed',
    };
  }

  // Determine overall health
  if (status.database.status === 'ok' && status.llm.status === 'ok') {
    status.overall = 'healthy';
  } else if (status.database.status === 'ok' || status.llm.status === 'ok') {
    status.overall = 'degraded';
  } else {
    status.overall = 'unhealthy';
  }

  const httpStatus = status.overall === 'healthy' ? 200 : status.overall === 'degraded' ? 207 : 503;

  return NextResponse.json(status, { status: httpStatus });
}
