# YojanaFinder — Government Benefits Finder

AI-powered platform that matches Indian citizens to government schemes they qualify for.

## Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI and OPENAI_API_KEY in .env

npm install
npm run seed       # Seeds 20 schemes into MongoDB
npm run dev        # Starts dev server at http://localhost:4000
```

### 2. Frontend Setup
```bash
cd frontend
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:4000

npm install
npm run dev        # Starts at http://localhost:3000
```

### 3. Test the flow
1. Open http://localhost:3000
2. Click "Find My Benefits"
3. Complete the 12-question quiz
4. View matched schemes + download PDF report

## Project Structure
```
govt-benefits-finder/
├── backend/
│   ├── functions/
│   │   ├── quiz/handler.js       # Quiz start + answer endpoints
│   │   ├── matcher/handler.js    # AI eligibility matching (GPT-4o)
│   │   ├── schemes/handler.js    # Scheme detail + personalised checklist
│   │   └── report/handler.js     # PDF report generation
│   ├── shared/
│   │   ├── models/               # Mongoose models (Scheme, Session)
│   │   ├── data/                 # Questions + 20 scheme seed data
│   │   └── utils/                # DB connection, response helpers
│   └── dev-server.js             # Express wrapper for local dev
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── quiz/page.tsx         # Conversational quiz
│   │   ├── results/page.tsx      # Matched schemes list
│   │   └── schemes/[id]/page.tsx # Scheme detail + application guide
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   ├── store.ts              # Zustand state
│   │   └── utils.ts              # Helpers
│   └── components/
│       └── Navbar.tsx
├── PRD.md                        # Full product requirements
└── API_CONTRACT.md               # Endpoint specifications
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PORT=4000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Deployment

### Frontend → AWS Amplify
Connect GitHub repo → select `frontend/` as root → Amplify auto-deploys on push.

### Backend → AWS Lambda + API Gateway
Each function in `backend/functions/` becomes a Lambda function.
Set environment variables in Lambda console.

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Zustand, Framer Motion
- **Backend**: Node.js, Express (dev) / AWS Lambda (prod)
- **Database**: MongoDB Atlas
- **AI**: OpenAI GPT-4o for eligibility matching + personalised guidance
- **PDF**: pdfkit
