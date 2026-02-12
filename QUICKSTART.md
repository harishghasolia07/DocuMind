# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed
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

# Optional: Supabase client (for future features)
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 3. Enable pgvector in Supabase

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

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# Optional: Open Prisma Studio to view database
npm run prisma:studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test the Application

### Quick Test Flow

1. **Upload a Document**
   - Create a test file: `echo "The sky is blue. Grass is green. Water is wet." > test.txt`
   - Upload via the web interface
   - Wait for "Upload successful" message

2. **Check Database**
   - Run: `npm run prisma:studio`
   - Verify `Document` and `Chunk` tables have data
   - Check that `Chunk` has embeddings stored

3. **Ask a Question**
   - Type: "What color is the sky?"
   - Click "Get Answer"
   - Should see answer citing your document

4. **Check System Status**
   - Visit: [http://localhost:3000/status](http://localhost:3000/status)
   - Both Database and LLM should show "Connected"

## Troubleshooting

### Error: "pgvector extension not enabled"
**Solution**: Run the SQL command in step 3 above

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
