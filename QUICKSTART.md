# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Clerk account created (free tier available)
- [ ] Supabase account created
- [ ] OpenAI API key obtained

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Get these from Supabase Project Settings → Database
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Get from OpenAI Platform → API Keys
OPENAI_API_KEY="sk-..."

# Get from Clerk Dashboard → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/sign-up)
2. Create a new application (choose "Next.js" as framework)
3. Copy the **Publishable Key** and **Secret Key**
4. Paste them into your `.env` file

### 4. Enable pgvector in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

4. Verify it's enabled:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 5. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push database schema
npx prisma db push

# Optional: Open Prisma Studio to view database
npm run prisma:studio
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test the Application

### Quick Test Flow

1. **Sign Up / Sign In**
   - Visit [http://localhost:3000](http://localhost:3000)
   - You'll be redirected to the sign-in page
   - Click "Sign up" and create a test account
   - Complete the sign-up process

2. **Upload a Document**
   - After signing in, click "Manage Documents" from the sidebar
   - Create a test file: `echo "The sky is blue. Grass is green. Water is wet." > test.txt`
   - Upload via the web interface
   - Wait for "Upload successful" toast notification

3. **Check Database**
   - Run: `npm run prisma:studio`
   - Verify `Document` and `Chunk` tables have data with your userId
   - Check that `Chunk` has embeddings stored
   - Verify `ChatSession` table exists

4. **Ask a Question**
   - Return to the main chat interface
   - Type: "What color is the sky?"
   - Press Enter or click send
   - Should see answer citing your document
   - Chat should auto-save with a title

5. **Test Chat History**
   - Click "New Chat" in the sidebar
   - Ask another question
   - Verify you can switch between chats in the sidebar
   - Test deleting a chat

6. **Check System Status**
   - Visit: [http://localhost:3000/status](http://localhost:3000/status)
   - Both Database and LLM should show "Connected"

7. **Test Multi-User Isolation**
   - Sign out using the UserButton in the sidebar
   - Create a second account
   - Upload a document and create a chat
   - Verify you don't see the first user's documents or chats

## Troubleshooting

### Error: "Blank sign-in page" or Clerk not loading
**Solutions**:
- Ensure Clerk API keys are real (not placeholder values)
- Keys should start with `pk_test_` and `sk_test_` for development
- Check all 7 Clerk environment variables are set in `.env`
- Restart dev server: `pkill -f "next dev" && npm run dev`
- Clear browser cache and cookies

### Error: "Unauthorized" when using the app
**Solutions**:
- Make sure you're signed in (check for user icon in sidebar)
- Sign out and sign back in
- Check browser console for Clerk authentication errors
- Verify middleware.ts is not blocking authenticated routes

### Error: "pgvector extension not enabled"
**Solution**: Run the SQL command in step 4 above

### Error: "Failed to generate embedding"
**Solutions**:
- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has credits
- Test key with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

### Error: "Database connection failed"
**Solutions**:
- Verify connection strings are correct (check for typos)
- Ensure Supabase project is running (not paused)
- Check IP allowlist in Supabase settings (if enabled)
- Try using `DIRECT_URL` for both variables temporarily

### Error: "Module not found" or TypeScript errors
**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npm run prisma:generate
```

### Port 3000 already in use
**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables (same as `.env`)
5. Deploy!

### 3. Post-Deployment
- Visit your deployment URL
- Test upload and Q&A functionality
- Check `/status` endpoint

## Next Steps

- [ ] Upload real documents
- [ ] Test with various question types
- [ ] Monitor costs in OpenAI dashboard
- [ ] Review [AI_NOTES.md](AI_NOTES.md) for architecture details
- [ ] Check [PROMPTS_USED.md](PROMPTS_USED.md) for prompt engineering

## Cost Estimates

**Per 1000 questions**:
- Embeddings: ~$0.03
- LLM calls: ~$1.50
- **Total**: ~$1.53

**Monthly (100 users, 10 questions/day)**:
- ~$50/month for AI
- Free tier for hosting (Vercel) and database (Supabase 500MB)

## Support

- Read [README.md](README.md) for full documentation
- Check [AI_NOTES.md](AI_NOTES.md) for technical details
- Review code comments for implementation specifics

---

**Ready to build!** 🚀
