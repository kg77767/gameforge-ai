# GameForge AI

GameForge AI is a web app where users can:
- create an account with email/password
- generate games with AI
- save games to a public or private library
- play the generated mini-games
- manage their profile

## Tech stack
- Next.js
- Supabase
- OpenAI API

## Local development

1. Install dependencies
   npm install

2. Create a .env.local file
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-openai-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

3. Start the app
   npm run dev

4. Open:
   http://localhost:3000

## Supabase setup
Run the SQL script in your Supabase SQL editor to create:
- profiles table
- games table
- RLS policies

## Deployment
- Push to GitHub
- Import to Vercel
- Add environment variables
- Add your production domain to Supabase auth redirect URLs

## Notes
- Public games are visible to everyone
- Private games are visible only to the logged-in owner
- AI generation is validated before saving
