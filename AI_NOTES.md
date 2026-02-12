# AI Notes - Design Decisions & Technical Details

This document captures the key AI/ML design decisions, trade-offs, and technical implementation details for the DocuMind application.

## Overview

This is a **Retrieval-Augmented Generation (RAG)** system that combines:
1. **Vector similarity search** (information retrieval)
2. **Large Language Model** (answer generation)

## Core RAG Pipeline

```
Document → Chunking → Embedding → Storage (Vector DB)
                                      ↓
Question → Embedding → Similarity Search → Top-K Chunks
                                             ↓
                                    Context + Prompt → LLM → Answer
```

## Key Design Decisions

### 1. Chunking Strategy

**Decision**: 500-800 tokens per chunk with 100-token overlap, sentence-boundary-aware

**Rationale**:
- **500-800 tokens**: This range provides enough context for semantic coherence while fitting comfortably in embedding model limits (8192 tokens for text-embedding-3-small)
- **100-token overlap**: Prevents information loss at chunk boundaries, especially for concepts spanning multiple sentences
- **Sentence-aware splitting**: Avoids breaking mid-sentence, which would harm embedding quality

**Implementation** ([lib/chunking.ts](lib/chunking.ts)):
- Uses `tiktoken` library for accurate token counting
- Splits text on sentence boundaries (`.`, `!`, `?` followed by space)
- Builds chunks greedily up to `maxTokens`, then creates overlap window
- Falls back to mid-sentence split only if a single sentence exceeds `maxTokens`

**Alternatives Considered**:
- ❌ **Fixed character length**: Doesn't account for token density variations
- ❌ **Fixed token length without overlap**: Loses context at boundaries
- ❌ **Semantic chunking (e.g., paragraphs)**: More complex, requires NLP parsing

**Trade-offs**:
- ✅ Simple and fast
- ✅ Preserves sentence structure
- ⚠️ May not respect paragraph or topic boundaries
- ⚠️ Overlap increases storage and embedding costs by ~15-20%

---

### 2. Embedding Model

**Decision**: OpenAI `text-embedding-3-small` (1536 dimensions)

**Rationale**:
- **Cost-effective**: ~$0.02 per 1M tokens (10x cheaper than text-embedding-ada-002)
- **Good performance**: Outperforms ada-002 on most benchmarks
- **Moderate dimensionality**: 1536 dims balances between quality and storage/compute
- **Fast inference**: Lower latency than larger models

**Implementation** ([lib/embeddings.ts](lib/embeddings.ts)):
- Batch embedding generation for efficiency (all chunks in one API call)
- Uses `float` encoding for compatibility with pgvector
- Error handling for rate limits and API failures

**Alternatives Considered**:
- ❌ **text-embedding-3-large** (3072 dims): Better quality but 2x storage cost and slower search
- ❌ **open-source models** (e.g., sentence-transformers): Requires model hosting, slower cold starts
- ❌ **ada-002**: Legacy model, more expensive

**Trade-offs**:
- ✅ Excellent cost/performance ratio
- ✅ Hosted API (no infrastructure)
- ⚠️ Vendor lock-in to OpenAI
- ⚠️ Network latency for embedding generation

---

### 3. Similarity Search (Retrieval)

**Decision**: Cosine distance (`<=>` operator) on pgvector, top-5 results

**Rationale**:
- **Cosine distance**: Standard for normalized embeddings, measures angular similarity
- **pgvector**: PostgreSQL extension, avoids separate vector database
- **Top-5**: Provides sufficient context (~2500-4000 tokens) without overwhelming the LLM

**Implementation** ([app/actions/query.ts](app/actions/query.ts)):
```sql
SELECT *, (embedding <=> $1::vector) as distance
FROM "Chunk"
ORDER BY distance ASC
LIMIT 5
```
- Converts distance to similarity score for display: `similarity = 1 - distance`
- Stores embeddings as `vector(1536)` type in PostgreSQL
- Uses indexing for fast approximate nearest neighbor search (future: IVFFlat or HNSW)

**Alternatives Considered**:
- ❌ **Euclidean distance** (`<->`): Less suitable for normalized embeddings
- ❌ **Top-3**: May miss relevant context
- ❌ **Top-10**: Increases LLM cost and may dilute relevance
- ❌ **Separate vector DB** (Pinecone, Weaviate): Adds infrastructure complexity

**Trade-offs**:
- ✅ Simple architecture (single database)
- ✅ ACID guarantees from PostgreSQL
- ⚠️ Scaling limits (~1M vectors) compared to dedicated vector DBs
- ⚠️ Approximate search (IVFFlat) has recall trade-offs

---

### 4. LLM for Answer Generation

**Decision**: OpenAI `gpt-4o-mini` with temperature 0.3, max 500 tokens

**Rationale**:
- **gpt-4o-mini**: Faster and cheaper than GPT-4, better than GPT-3.5 for reasoning
- **Temperature 0.3**: Low temperature for deterministic, factual answers (not creative)
- **Max 500 tokens**: Ensures concise answers, prevents rambling

**Prompt Engineering** ([app/actions/query.ts](app/actions/query.ts)):
```
System Prompt:
- "Answer ONLY using information from the provided context"
- "If answer not found, say 'Not found in documents.'"
- "Cite document names"
- "Be concise and accurate"

User Prompt:
- Includes top-5 chunks with [Source N: document_name] headers
- Followed by the user's question
```

**Alternatives Considered**:
- ❌ **GPT-4**: Better quality but 10x more expensive and slower
- ❌ **GPT-3.5-turbo**: Cheaper but lower instruction-following quality
- ❌ **Open-source LLMs**: Requires hosting, harder to deploy

**Trade-offs**:
- ✅ Good balance of quality, speed, and cost
- ✅ Strong instruction following (stays in context)
- ⚠️ Can still hallucinate if context is ambiguous
- ⚠️ Vendor lock-in to OpenAI

---

### 5. Database Schema

**Decision**: Two-model Prisma schema with cascading deletes

**Models**:
- `Document`: Stores original text and metadata
- `Chunk`: Stores chunked text, embeddings, and references to parent document

**Rationale**:
- **Separate models**: Allows querying documents without loading all chunks
- **Cascading delete**: Deleting a document auto-deletes all chunks (referential integrity)
- **Chunk indexing**: Stores `chunkIndex` to preserve order

**Implementation** ([prisma/schema.prisma](prisma/schema.prisma)):
```prisma
model Document {
  id         String   @id @default(cuid())
  name       String
  content    String   @db.Text
  uploadedAt DateTime @default(now())
  chunks     Chunk[]
}

model Chunk {
  id         String                   @id @default(cuid())
  documentId String
  content    String                   @db.Text
  embedding  Unsupported("vector(1536)")?
  tokenCount Int
  chunkIndex Int
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
}
```

**Trade-offs**:
- ✅ Normalized schema (no duplication)
- ✅ Type-safe queries with Prisma
- ⚠️ `Unsupported` type for vectors (Prisma doesn't fully support pgvector yet)
- ⚠️ Requires raw SQL for vector operations

---

## Performance Optimizations

### Current
- **Batch embedding generation**: Reduces API calls from N to 1 per document
- **Single transaction for upload**: Atomic document + chunks insert
- **Server Actions**: Eliminates client-server API overhead

### Future Improvements
- **Vector indexing**: Use IVFFlat or HNSW for faster similarity search
- **Embedding caching**: Cache frequently queried embeddings in Redis
- **Streaming responses**: Stream LLM output for better UX
- **Parallel chunking**: Use worker threads for large documents

---

## Error Handling

### Implemented
- Empty question validation
- File type validation (`.txt` only)
- File size limits (10MB)
- OpenAI API error handling with user-friendly messages
- Database connection checks in status endpoint

### Future
- Retry logic for transient API failures
- Rate limiting per user
- Automatic fallback to smaller context if LLM token limit exceeded

---

## Cost Analysis

### Per Document Upload (10,000 tokens)
- **Embeddings**: ~20 chunks × 700 tokens = 14,000 tokens ≈ $0.0003
- **Storage**: 20 chunks × 6KB ≈ 120KB (negligible on Supabase free tier)

### Per Question
- **Question embedding**: ~20 tokens ≈ $0.0000004
- **LLM (gpt-4o-mini)**: ~3,000 tokens context + 500 tokens output ≈ $0.0015
- **Total per Q&A**: ~$0.0015

### Monthly Estimate (100 users, 10 questions/day each)
- **Total questions**: 30,000/month
- **LLM cost**: $45/month
- **Embedding cost**: ~$1/month
- **Database**: Supabase free tier (up to 500MB)
- **Hosting**: Vercel free tier
- **Total**: ~$50/month

---

## Monitoring & Observability

### Current
- `/api/status` endpoint for health checks
- Console error logging
- Client-side error messages

### Future
- **OpenTelemetry**: Trace request latency
- **Prometheus**: Monitor API call counts and failures
- **Sentry**: Error tracking and alerting
- **Custom metrics**: Track average similarity scores, answer quality ratings

---

## Security Considerations

### Current
- Environment variable protection (`.env` in `.gitignore`)
- Server-side API key usage (never exposed to client)
- File type and size validation

### Future
- **Authentication**: User accounts with NextAuth.js
- **Rate limiting**: Prevent abuse
- **Input sanitization**: Prevent prompt injection attacks
- **Document-level permissions**: Multi-tenant support

---

## References

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [RAG Best Practices (LangChain)](https://python.langchain.com/docs/use_cases/question_answering/)
- [Chunking Strategies for RAG](https://www.pinecone.io/learn/chunking-strategies/)

---

**Last Updated**: February 11, 2026
