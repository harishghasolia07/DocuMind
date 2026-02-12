# Private Knowledge Q&A

A production-ready RAG (Retrieval-Augmented Generation) application that allows users to upload text documents, generate embeddings, and ask questions using AI-powered search and OpenAI's language models.

## Features

- 📤 **Document Upload**: Upload `.txt` files to build your knowledge base
- 🔍 **Semantic Search**: Find relevant information using vector similarity search
- 🤖 **AI-Powered Q&A**: Get accurate answers from your documents using GPT-4o-mini
- 📊 **Source Attribution**: See which documents and chunks were used for each answer
- 💚 **Health Monitoring**: Built-in status page to check system health
- ⚡ **Modern Stack**: Built with Next.js 14+, TypeScript, Tailwind CSS, and Prisma

## Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Server Components** and **Server Actions** for optimal performance

### Backend
- **Next.js API Routes** for REST endpoints
- **Server Actions** for form handling and mutations

### Database
- **PostgreSQL** with **pgvector** extension (via Supabase)
- **Prisma ORM** for type-safe database access

### AI/ML
- **OpenAI GPT-4o-mini** for answer generation
- **text-embedding-3-small** for embeddings (1536 dimensions)

### Deployment
- **Vercel** for frontend and API hosting
- **Supabase** for managed PostgreSQL with pgvector

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
│         (Next.js App Router + Tailwind CSS)         │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐     ┌──────────────┐
│    Server    │     │   API Routes │
│   Actions    │     │   (/status)  │
└──────┬───────┘     └──────┬───────┘
       │                    │
       └──────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐     ┌─────────────┐
│   Prisma     │────▶│  PostgreSQL │
│   Client     │     │  + pgvector │
└──────────────┘     └─────────────┘
        │
        ▼
┌──────────────┐
│   OpenAI     │
│     API      │
└──────────────┘
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account (or local PostgreSQL with pgvector)
- OpenAI API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd aggroso
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database - Get from Supabase project settings
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/database"

# OpenAI
OPENAI_API_KEY="sk-..."

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Set Up Supabase Database

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

3. Copy the connection string from **Project Settings → Database**

### 4. Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Upload Documents
1. Click "Choose File" and select a `.txt` file (max 10MB)
2. Click "Upload Document"
3. Wait for processing (chunking + embedding generation)

### Ask Questions
1. Type your question in the text area
2. Click "Get Answer"
3. View the AI-generated answer and source chunks

### Check System Health
- Navigate to `/status` or click "System Status" button
- View database and LLM connection status

## Project Structure

```
aggroso/
├── app/
│   ├── actions/           # Server Actions
│   │   ├── upload.ts      # Document upload & chunk storage
│   │   └── query.ts       # Question answering with RAG
│   ├── api/
│   │   └── status/        # Health check endpoint
│   │       └── route.ts
│   ├── status/            # Status page
│   │   └── page.tsx
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── UploadForm.tsx
│   ├── DocumentList.tsx
│   ├── QuestionForm.tsx
│   └── AnswerDisplay.tsx
├── lib/                   # Core utilities
│   ├── prisma.ts          # Prisma client singleton
│   ├── openai.ts          # OpenAI client
│   ├── chunking.ts        # Text chunking logic
│   └── embeddings.ts      # Embedding generation
├── prisma/
│   └── schema.prisma      # Database schema
├── .env.example           # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy!

Vercel will automatically:
- Install dependencies
- Run `prisma generate` (via build script)
- Build and deploy the app

### Database Setup for Production

Use your Supabase connection strings in Vercel environment variables. Ensure:
- `pgvector` extension is enabled
- Database migrations are applied (run locally or via Vercel build)

## What's Done ✅

- ✅ Next.js project with TypeScript and Tailwind CSS
- ✅ Prisma schema with Document and Chunk models
- ✅ Vector embeddings with OpenAI text-embedding-3-small
- ✅ Intelligent text chunking (500-800 tokens, sentence-aware)
- ✅ Document upload with automatic embedding generation
- ✅ RAG-based question answering with GPT-4o-mini
- ✅ Similarity search using pgvector cosine distance
- ✅ Source attribution with document names and chunks
- ✅ Status page with health checks
- ✅ Responsive UI with Tailwind CSS
- ✅ Error handling for common scenarios
- ✅ Documentation files

## What's Not Done / Future Improvements 🚀

- ⏳ **File format support**: Add support for PDF, DOCX, Markdown
- ⏳ **Authentication**: User accounts and document privacy
- ⏳ **Multi-document filtering**: Filter by multiple documents in Q&A
- ⏳ **Chunk preview**: Show more/less buttons for long chunks
- ⏳ **Document editing**: Edit or re-chunk existing documents
- ⏳ **Export answers**: Download Q&A history as PDF or JSON
- ⏳ **Advanced chunking**: Semantic chunking, metadata extraction
- ⏳ **Rate limiting**: Prevent API abuse
- ⏳ **Caching**: Cache embeddings and LLM responses
- ⏳ **Analytics**: Track question patterns and answer quality
- ⏳ **Dark mode**: Theme switcher
- ⏳ **Streaming responses**: Stream LLM output in real-time

## Troubleshooting

### "pgvector extension not enabled"
Run this in your Supabase SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### "Failed to generate embedding"
- Check your `OPENAI_API_KEY` is valid
- Ensure you have credits in your OpenAI account

### "Database connection failed"
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check Supabase project is running
- Ensure IP allowlist includes your location (if enabled)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ using Next.js, OpenAI, and Supabase**
