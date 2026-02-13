# DocuMind

A production-ready RAG (Retrieval-Augmented Generation) application with multi-user authentication that allows users to upload documents, generate embeddings, and ask questions using AI-powered search with a ChatGPT-style interface.

## Features

- 🔐 **User Authentication**: Secure multi-user authentication with Clerk
- 📤 **Document Upload**: Upload `.txt` files to build your private knowledge base
- 💬 **ChatGPT-Style Interface**: Modern chat interface with sidebar navigation
- 🔍 **Semantic Search**: Find relevant information using vector similarity search
- 🤖 **AI-Powered Q&A**: Get accurate answers from your documents using GPT-4o-mini
- 💾 **Auto-Save Chats**: Conversations automatically saved with timestamps
- 📊 **Source Attribution**: See which documents and chunks were used for each answer
- 🔒 **Data Isolation**: Each user's documents and chats are completely private
- 💚 **Health Monitoring**: Built-in status page to check system health
- 🌙 **Dark Theme**: Modern dark blue-black theme with grid background
- ⚡ **Modern Stack**: Built with Next.js 16+, TypeScript, Tailwind CSS, and Prisma

## Tech Stack

### Frontend
- **Next.js 16.1.6** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Server Components** and **Server Actions** for optimal performance
- **Clerk** for authentication and user management

### Backend
- **Next.js API Routes** for REST endpoints
- **Server Actions** for form handling and mutations
- **Clerk Middleware** for route protection

### Database
- **PostgreSQL** with **pgvector** extension (via Supabase)
- **Prisma ORM** for type-safe database access
- **Multi-tenant architecture** with userId-based isolation

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
cd documind
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

Edit `.env` with your actual values:

```env
# Database - Get from Supabase project settings
DATABASE_URL="postgresql://user:password@host:6543/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/database"

# OpenAI
OPENAI_API_KEY="sk-..."

# Clerk Authentication - Get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. Set Up Clerk Authentication

1. Create a free account at [Clerk](https://dashboard.clerk.com/sign-up)
2. Create a new application
3. Copy your API keys from the dashboard
4. Add them to your `.env` file

### 4. Set Up Supabase Database

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

3. Copy the connection string from **Project Settings → Database**

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Push database schema
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Sign In / Sign Up
1. Visit [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to the sign-in page
3. Create a new account or sign in with an existing one
4. Access the main chat interface

### Upload Documents
1. Click "Manage Documents" from the sidebar or navigate to `/documents`
2. Click "Choose File" and select a `.txt` file (max 10MB)
3. Click "Upload Document"
4. Wait for processing (chunking + embedding generation)

### Chat and Ask Questions
1. Type your question in the chat interface
2. Press Enter or click the send button
3. View the AI-generated answer with source attribution
4. Chats are automatically saved with titles

### Manage Chat History
1. View all saved chats in the sidebar
2. Click any chat to load the conversation
3. Click "New Chat" to start fresh
4. Delete unwanted chats using the trash icon

### Check System Health
- Navigate to `/status` to view system health
- Check database and LLM connection status

## Project Structure

```
documind/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── upload.ts         # Document upload & chunk storage
│   │   ├── query.ts          # RAG question answering
│   │   └── chat.ts           # Chat session management
│   ├── api/
│   │   └── status/           # Health check endpoint
│   │       └── route.ts
│   ├── sign-in/              # Clerk sign-in page
│   │   └── [[...sign-in]]/
│   │       └── page.tsx
│   ├── sign-up/              # Clerk sign-up page
│   │   └── [[...sign-up]]/
│   │       └── page.tsx
│   ├── documents/            # Document management page
│   │   └── page.tsx
│   ├── chats/                # Chat history pages
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── status/               # Status page
│   │   └── page.tsx
│   ├── globals.css           # Global styles with dark theme
│   ├── layout.tsx            # Root layout with ClerkProvider
│   └── page.tsx              # Main chat interface
├── components/               # React components
│   ├── UploadForm.tsx
│   ├── DocumentList.tsx
│   ├── QuestionForm.tsx
│   ├── AnswerDisplay.tsx
│   ├── ChatSidebar.tsx
│   └── ToastProvider.tsx
├── lib/                      # Core utilities
│   ├── prisma.ts             # Prisma client singleton
│   ├── openai.ts             # OpenAI client
│   ├── chunking.ts           # Text chunking logic
│   └── embeddings.ts         # Embedding generation
├── prisma/
│   └── schema.prisma         # Database schema with userId fields
├── middleware.ts             # Clerk authentication middleware
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment variables template
├── AUTHENTICATION.md         # Authentication documentation
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in project settings:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/`
4. Deploy!

Vercel will automatically:
- Install dependencies
- Run `prisma generate` (via build script)
- Build and deploy the app

### Database Setup for Production

Use your Supabase connection strings in Vercel environment variables. Ensure:
- `pgvector` extension is enabled
- Database migrations are applied (run `npx prisma db push` locally)

### Clerk Setup for Production

In your Clerk dashboard:
1. Add your production domain to allowed domains
2. Update redirect URLs for production
3. Use production API keys (starts with `pk_live_` and `sk_live_`)

## What's Done ✅

### Core Features
- ✅ Next.js 16 project with TypeScript and Tailwind CSS
- ✅ **User authentication with Clerk (multi-tenant support)**
- ✅ **ChatGPT-style interface with sidebar navigation**
- ✅ **Auto-save chat functionality with timestamps**
- ✅ **Dark theme with modern grid background**
- ✅ **User profile management with UserButton**
- ✅ **Data isolation - users only see their own content**

### RAG Implementation
- ✅ Prisma schema with Document, Chunk, and ChatSession models
- ✅ Vector embeddings with OpenAI text-embedding-3-small
- ✅ Intelligent text chunking (500-800 tokens, sentence-aware)
- ✅ Document upload with automatic embedding generation
- ✅ RAG-based question answering with GPT-4o-mini
- ✅ Similarity search using pgvector cosine distance
- ✅ **Conversation-aware RAG with chat history context** 🆕
- ✅ **Similarity threshold filtering (30% minimum relevance)** 🆕
- ✅ **Increased retrieval from 5 to 10 chunks for better coverage** 🆕

### User Experience
- ✅ **Markdown-formatted answers with syntax highlighting** 🆕
- ✅ Source attribution with document names and chunks
- ✅ Status page with health checks
- ✅ Toast notifications for user feedback
- ✅ Responsive UI with Tailwind CSS
- ✅ Error handling for common scenarios

### Documentation
- ✅ Complete documentation (README, QUICKSTART, AUTHENTICATION, IMPROVEMENTS)
- ✅ AI implementation notes and design decisions

**🆕 = Recently added improvements** • See [IMPROVEMENTS.md](IMPROVEMENTS.md) for details

## Future Improvements 🚀

- ⏳ **File format support**: Add support for PDF, DOCX, Markdown
- ⏳ **Streaming responses**: Stream LLM output in real-time
- ⏳ **Document editing**: Edit or re-chunk existing documents
- ⏳ **Export functionality**: Download chats as PDF or JSON
- ⏳ **Advanced chunking**: Semantic chunking, metadata extraction
- ⏳ **Rate limiting**: Prevent API abuse
- ⏳ **Caching**: Cache embeddings and LLM responses
- ⏳ **Analytics**: Track question patterns and answer quality
- ⏳ **Collaborative features**: Share documents with other users
- ⏳ **Mobile app**: Native iOS/Android applications

## Troubleshooting

### "Blank sign-in page" or "Clerk not loading"
- Verify your Clerk API keys are valid (not placeholder values)
- Check that keys start with `pk_test_` and `sk_test_` for development
- Ensure all Clerk environment variables are set correctly
- Restart the dev server after changing `.env`

### "Unauthorized" errors in the app
- Make sure you're signed in
- Clear cookies and sign in again
- Check browser console for Clerk errors

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
