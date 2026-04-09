# Government Benefits Finder — Product Requirements Document

**Version:** 1.0  
**Date:** April 2026  
**Author:** Priyank Agrawal  

---

## 1. Problem Statement

### The Core Problem
Every year, **billions in government benefits go unclaimed** — not because people don't need them, but because they don't know they qualify.

In India alone:
- ₹1.7 lakh crore in welfare schemes remain underutilised annually
- 60%+ of eligible citizens don't claim Ayushman Bharat health coverage
- MGNREGA has ₹8,000+ crore in unpaid wages due to application failures
- Over 400 central + state government schemes exist — no single place shows what you qualify for

### Why It Happens
1. **Fragmentation** — Schemes are spread across 30+ government portals, each with different logins
2. **Jargon** — Eligibility criteria written in bureaucratic language nobody understands
3. **Awareness gap** — People in rural areas hear about schemes 2–3 years after launch
4. **Application complexity** — Wrong documents, wrong office, wrong form = rejection
5. **No personalisation** — Government websites list all schemes, not *your* schemes

### Who Gets Hurt Most
The people who need benefits most — low-income families, farmers, women, students, senior citizens, PWD — are least equipped to navigate the system.

---

## 2. Solution

**Government Benefits Finder** is an AI-powered platform that:

1. Asks users 10–12 simple questions about their life situation (in plain language, conversationally)
2. Matches their profile against a database of 200+ government schemes
3. Returns a **personalised benefits report**: what they qualify for, how to apply, what documents to bring, deadlines
4. Guides them through the application process step by step

**One sentence:** *Tell us about yourself, we tell you every rupee the government owes you.*

---

## 3. Target Users

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| **Low-income families** | BPL/APL households, urban slums | Housing, food, health schemes |
| **Farmers** | Small/marginal farmers | Crop insurance, subsidies, loans |
| **Students** | Class 10–PG level | Scholarships, skill development |
| **Women** | Especially rural | Self-employment, maternity, safety |
| **Senior Citizens** | 60+ | Pension, health, transport |
| **Small Business Owners** | Micro/small enterprises | MUDRA loans, subsidies, GST benefits |
| **PWD** | Persons with Disabilities | Assistive devices, employment, transport |
| **NGOs / Social Workers** | Help communities apply | Bulk eligibility checking for beneficiaries |

---

## 4. Core Features

### MVP (Phase 1)

#### 4.1 Conversational Eligibility Quiz
- Not a boring form — a chat interface that asks one question at a time
- AI adapts next question based on previous answer (e.g., if farmer → ask crop type, land size)
- Questions cover: state, age, gender, income, occupation, family size, land ownership, disability, education level, employment status
- Completes in under 3 minutes
- Available in English + Hindi (Phase 1), regional languages (Phase 2)

#### 4.2 AI Benefits Matcher
- Maps user profile against scheme eligibility criteria in real time
- Returns ranked list: **Definitely Qualifies → Likely Qualifies → Check Eligibility**
- Each result shows: scheme name, benefit amount/type, issuing ministry, confidence score
- Uses GPT-4o to handle edge cases and ambiguous eligibility rules

#### 4.3 Personalised Benefits Report
Each matched scheme shows:
- **What you get** — exact benefit in plain language (₹6,000/year, free health cover up to ₹5 lakh, etc.)
- **How to apply** — step-by-step, specific to their state
- **Documents needed** — personalised checklist (not generic list)
- **Where to go** — nearest office / online portal link
- **Deadline** — if applicable
- **Estimated time** — how long the process takes

#### 4.4 Scheme Database
- 200+ central government schemes at launch
- 50+ state-specific schemes (starting with top 5 states by population)
- Each scheme stored with: eligibility rules, benefit details, application process, documents, portal links, ministry contact
- Admin panel to add/update schemes as government launches new ones
- AI-assisted scheme data extraction from government PDFs/notifications

#### 4.5 Save & Share
- Generate a shareable PDF report of matched benefits
- WhatsApp share button (critical for rural India)
- Save profile to come back later (no login required — magic link via phone number)

---

### Phase 2 Features

#### 4.6 Application Tracker
- User marks which schemes they applied for
- Tracks status (Applied → Documents Submitted → Approved → Benefit Received)
- Reminds them of follow-up steps

#### 4.7 NGO / Social Worker Dashboard
- Bulk profile entry — enter 50 beneficiaries at once
- Download eligibility report for entire community
- Track application status for all beneficiaries

#### 4.8 Scheme Alerts
- User subscribes to alerts for new schemes in their category
- WhatsApp/SMS notification when new scheme launches that matches their profile
- Deadline reminders for time-bound schemes

#### 4.9 Vernacular AI Chat
- After seeing results, user can ask in Hindi: "यह योजना मेरे लिए कैसे apply करूँ?"
- AI answers in same language, guiding them through application

---

## 5. Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | Full-stack framework, SSR for SEO |
| **TailwindCSS** | Styling |
| **shadcn/ui** | Component library |
| **Zustand** | Client state (quiz progress) |
| **Framer Motion** | Conversational quiz animations |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | API server |
| **MongoDB** | Scheme database + user sessions |
| **Mongoose** | ODM for MongoDB |
| **Redis** | Session caching, rate limiting |

### AI Layer
| Technology | Purpose |
|------------|---------|
| **OpenAI GPT-4o** | Eligibility matching, document checklist generation, plain-language explanations |
| **OpenAI Embeddings** | Semantic search over scheme database |
| **LangChain** | Orchestration, prompt management, RAG pipeline |
| **Pinecone / MongoDB Atlas Vector** | Vector store for scheme embeddings |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **AWS Amplify** | Next.js frontend hosting + CI/CD |
| **AWS Lambda** | Serverless Node.js API functions |
| **AWS API Gateway** | Routes HTTP requests to Lambda |
| **AWS S3** | PDF report storage |
| **AWS SES** | Email delivery |
| **MongoDB Atlas** | Managed database |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    USER BROWSER                      │
│                                                      │
│   Next.js Frontend (AWS Amplify)                     │
│   ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│   │ Eligibility  │  │  Results    │  │  Report   │ │
│   │    Quiz      │  │   Page      │  │   PDF     │ │
│   └──────┬───────┘  └──────┬──────┘  └─────┬─────┘ │
└──────────┼────────────────┼───────────────┼─────────┘
           │                │               │
           ▼                ▼               ▼
┌─────────────────────────────────────────────────────┐
│           AWS API Gateway (REST API)                 │
└────────────────────────┬────────────────────────────┘
                         │
           ┌─────────────┼──────────────┐
           ▼             ▼              ▼
  ┌────────────┐  ┌────────────┐  ┌───────────────┐
  │  Lambda    │  │  Lambda    │  │    Lambda     │
  │ quiz-fn    │  │ matcher-fn │  │  report-fn    │
  │            │  │            │  │               │
  │ Quiz logic │  │ AI Matcher │  │ PDF → S3      │
  └─────┬──────┘  └─────┬──────┘  └───────────────┘
        │               │
        ▼               ▼
┌───────────────┐  ┌────────────────┐
│  MongoDB      │  │  OpenAI API    │
│  Atlas        │  │                │
│  - schemes    │  │  - GPT-4o      │
│  - sessions   │  │  - Embeddings  │
│  - reports    │  │  - LangChain   │
└───────────────┘  └────────────────┘
```

---

## 7. Database Schema

### Scheme Collection
```javascript
{
  _id: ObjectId,
  schemeId: "PM-KISAN-001",
  name: "PM Kisan Samman Nidhi",
  nameHindi: "पीएम किसान सम्मान निधि",
  ministry: "Ministry of Agriculture",
  category: ["farmer", "rural", "income-support"],
  benefit: {
    type: "cash",  // cash | kind | service | loan | insurance
    amount: 6000,
    currency: "INR",
    frequency: "annual",  // one-time | monthly | quarterly | annual
    description: "₹6,000 per year in 3 instalments of ₹2,000"
  },
  eligibility: {
    // Structured rules for programmatic matching
    rules: [
      { field: "occupation", operator: "includes", value: "farmer" },
      { field: "landOwnership", operator: "lte", value: 2 },  // hectares
      { field: "income", operator: "lte", value: 200000 }
    ],
    // Plain language for AI to reason about edge cases
    plainText: "Small and marginal farmers who own cultivable land. Excludes institutional land holders, farmer families with members who are/were constitutional post holders, serving/retired officers of Central/State govt services...",
    exclusions: ["government_employee", "income_tax_payer", "professional"]
  },
  application: {
    mode: ["online", "offline"],
    portal: "https://pmkisan.gov.in",
    office: "Local Patwari / Agriculture Office",
    steps: [
      "Visit pmkisan.gov.in or local Common Service Centre",
      "Click 'New Farmer Registration'",
      "Enter Aadhaar number and state",
      "Fill in land and bank details",
      "Submit and note registration number"
    ]
  },
  documents: [
    { name: "Aadhaar Card", required: true },
    { name: "Land Records (Khatoni/Khasra)", required: true },
    { name: "Bank Account Passbook", required: true },
    { name: "Mobile Number linked to Aadhaar", required: true }
  ],
  state: "all",  // "all" or specific state code
  launchDate: ISODate("2019-02-01"),
  status: "active",  // active | paused | discontinued
  lastVerified: ISODate("2026-03-01"),
  embedding: [/* vector for semantic search */],
  metadata: {
    totalBeneficiaries: 110000000,
    popularityScore: 95,
    successRate: 78  // % of applicants who successfully receive benefit
  }
}
```

### User Session Collection
```javascript
{
  _id: ObjectId,
  sessionId: "uuid",
  phone: "+91XXXXXXXXXX",  // optional, for save & return
  profile: {
    state: "Rajasthan",
    district: "Jaipur",
    age: 45,
    gender: "male",
    occupation: "farmer",
    landHolding: 1.5,  // hectares
    annualIncome: 85000,
    familySize: 5,
    bplCard: true,
    rationCardType: "yellow",
    disability: false,
    educationLevel: "class_10",
    castCategory: "OBC",
    employmentStatus: "self_employed"
  },
  matchedSchemes: [
    {
      schemeId: "PM-KISAN-001",
      confidenceScore: 0.98,
      matchType: "definite",  // definite | likely | check
      appliedStatus: "not_applied"
    }
  ],
  reportUrl: "https://...",
  createdAt: ISODate,
  expiresAt: ISODate  // 30 days
}
```

### Quiz Questions Collection
```javascript
{
  _id: ObjectId,
  questionId: "q_occupation",
  text: "What is your main occupation?",
  textHindi: "आपका मुख्य व्यवसाय क्या है?",
  type: "single_choice",  // single_choice | multi_choice | number | text | boolean
  options: [
    { value: "farmer", label: "Farmer", labelHindi: "किसान" },
    { value: "daily_wage", label: "Daily Wage Worker", labelHindi: "दिहाड़ी मज़दूर" },
    { value: "small_business", label: "Small Business Owner", labelHindi: "छोटे व्यवसायी" },
    { value: "government_employee", label: "Government Employee", labelHindi: "सरकारी कर्मचारी" },
    { value: "student", label: "Student", labelHindi: "छात्र" },
    { value: "homemaker", label: "Homemaker", labelHindi: "गृहिणी" },
    { value: "unemployed", label: "Unemployed", labelHindi: "बेरोज़गार" }
  ],
  followUpLogic: {
    // If farmer → ask land holding next
    "farmer": "q_land_holding",
    // If student → ask education level next
    "student": "q_education_level",
    // Default next question
    "default": "q_annual_income"
  },
  order: 2,
  required: true
}
```

---

## 8. AI Integration

### 8.1 Eligibility Matching (Core AI Feature)

**Approach:** Hybrid — rule-based matching for clear criteria + GPT-4o for edge cases

```
User Profile → Rule Engine → Clear matches (0.9+ confidence)
                           → Ambiguous cases → GPT-4o → Final verdict
```

**GPT-4o Prompt Pattern:**
```
You are a government scheme eligibility expert for India.

User Profile:
- State: Rajasthan
- Age: 45, Gender: Male
- Occupation: Farmer, Land: 1.5 hectares
- Annual Income: ₹85,000
- Family: 5 members, BPL card: Yes

Scheme: PM Kisan Samman Nidhi
Eligibility: [scheme eligibility text]

Question: Does this user qualify? 
Return JSON: { qualifies: true/false, confidence: 0-1, reason: "...", caveat: "..." }
```

### 8.2 Document Checklist Generator
GPT-4o generates personalised document list based on:
- Scheme requirements + user profile
- Avoids listing documents user already has (e.g., if they said they have Aadhaar)
- Flags documents they may need to get first

### 8.3 Plain Language Explainer
Converts bureaucratic eligibility text into 2-sentence plain English + Hindi explanation.

### 8.4 Conversational Q&A (Phase 2)
RAG over scheme database — user asks "do I qualify if my wife owns the land?" → AI searches scheme details + answers specifically.

---

## 9. User Flow

```
Landing Page
    │
    ▼
"Find My Benefits" CTA
    │
    ▼
Conversational Quiz (12 questions, ~3 min)
    │   Q1: Which state are you from?
    │   Q2: What is your age?
    │   Q3: What is your occupation?
    │   Q4: [Dynamic based on Q3]
    │   ...
    │
    ▼
"Matching your profile..." (AI processing, 3-5 sec)
    │
    ▼
Results Page
    │   ┌─────────────────────────────────┐
    │   │ 🎯 You qualify for 14 schemes   │
    │   │ 💰 Total potential value: ₹1.2L │
    │   └─────────────────────────────────┘
    │
    │   DEFINITELY QUALIFY (8 schemes)
    │   ├── PM Kisan (₹6,000/yr) → View Guide
    │   ├── Ayushman Bharat (₹5L health) → View Guide
    │   └── ...
    │
    │   LIKELY QUALIFY (4 schemes)
    │   └── ...
    │
    ▼
Scheme Detail Page
    │   - What you get
    │   - Step-by-step application
    │   - Your document checklist
    │   - Nearest office / portal link
    │
    ▼
Download PDF Report / Share on WhatsApp
```

---

## 10. API Endpoints

```
POST   /api/quiz/start              → Create session, return Q1
POST   /api/quiz/answer             → Submit answer, return next question
POST   /api/match/schemes           → Run eligibility matching on completed profile
GET    /api/schemes/:id             → Scheme detail
POST   /api/report/generate         → Generate PDF report
GET    /api/report/:sessionId       → Get generated report

POST   /api/admin/schemes           → Add new scheme (admin only)
PUT    /api/admin/schemes/:id       → Update scheme
GET    /api/admin/schemes           → List all schemes with status

GET    /api/health                  → Health check
```

---

## 11. MVP Scope & Timeline

### Week 1 — Foundation
- [ ] Project setup (Next.js + Node.js + MongoDB)
- [ ] Scheme database — seed 50 major central schemes
- [ ] Quiz engine — 12 questions with branching logic
- [ ] Basic rule-based eligibility matching

### Week 2 — AI Layer
- [ ] GPT-4o eligibility matching for edge cases
- [ ] Document checklist generator
- [ ] Plain language explainer per scheme
- [ ] Results page with confidence scores

### Week 3 — Polish & Launch
- [ ] PDF report generation
- [ ] WhatsApp share
- [ ] Hindi UI
- [ ] Admin panel for scheme management
- [ ] Deploy to AWS Amplify (frontend) + Lambda (API)

### Post-Launch
- [ ] Expand to 200+ schemes
- [ ] State-specific schemes (UP, Maharashtra, Tamil Nadu, West Bengal, Karnataka)
- [ ] NGO dashboard
- [ ] Application tracker
- [ ] SMS/WhatsApp alerts

---

## 12. Monetisation (Future)

| Model | Description |
|-------|-------------|
| **B2G** | Sell to state governments as official discovery tool |
| **NGO SaaS** | ₹999/month for NGO bulk dashboard |
| **CSC Partnership** | Revenue share with Common Service Centres that use the tool |
| **Premium Report** | ₹49 for detailed application guidance PDF |
| **API Licensing** | Fintech / insurance companies integrate eligibility API |

---

## 13. Why This Wins

| Factor | Details |
|--------|---------|
| **Market size** | 600M+ eligible Indians with no discovery tool |
| **No real competitor** | MyScheme.gov.in exists but is a static directory, not personalised |
| **High virality** | "I found ₹25,000 in benefits I didn't know about" → naturally shareable |
| **Social impact** | Real, measurable — benefits claimed = lives improved |
| **Technical depth** | RAG + multi-step AI matching + multilingual NLP showcases full stack |
| **Portfolio value** | Solves a real problem with AI, not a toy demo |

---

## 14. Environment Variables

```env
# OpenAI
OPENAI_API_KEY=

# MongoDB
MONGODB_URI=

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=govt-benefits-reports

# App
NEXT_PUBLIC_API_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/prod

# Optional — Claude as fallback LLM
ANTHROPIC_API_KEY=
```

---

*This document is the single source of truth for the Government Benefits Finder MVP.*
