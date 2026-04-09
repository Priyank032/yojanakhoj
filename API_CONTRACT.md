# API Contract — Government Benefits Finder
# Shared between Frontend and Backend agents

BASE_URL: https://<api-id>.execute-api.ap-south-1.amazonaws.com/prod
DEV_URL:  http://localhost:4000

---

## POST /quiz/start
Start a new session, returns first question.

Request: {}

Response:
{
  sessionId: string,
  question: {
    questionId: string,
    text: string,
    textHindi: string,
    type: "single_choice" | "number" | "boolean",
    options?: { value: string, label: string, labelHindi: string }[],
    progress: number   // 0-100
  }
}

---

## POST /quiz/answer
Submit answer, get next question or completion signal.

Request:
{
  sessionId: string,
  questionId: string,
  answer: string | number | boolean
}

Response:
{
  sessionId: string,
  done: false,
  question: { ...same as above... }
}
OR
{
  sessionId: string,
  done: true,
  totalQuestions: number
}

---

## POST /match/schemes
Run AI eligibility matching on completed profile.

Request: { sessionId: string }

Response:
{
  sessionId: string,
  profile: {
    state: string, age: number, occupation: string,
    annualIncome: number, familySize: number
  },
  summary: {
    totalMatched: number,
    definiteCount: number,
    likelyCount: number,
    totalValueINR: number   // estimated annual value
  },
  schemes: [
    {
      schemeId: string,
      name: string,
      nameHindi: string,
      category: string[],
      matchType: "definite" | "likely" | "check",
      confidenceScore: number,   // 0-1
      benefit: {
        type: string,
        amount: number,
        currency: "INR",
        frequency: string,
        description: string
      },
      ministry: string,
      tags: string[]
    }
  ]
}

---

## GET /schemes/:schemeId
Full scheme detail with personalised application guide.

Query: ?sessionId=string (for personalised doc checklist)

Response:
{
  schemeId: string,
  name: string,
  nameHindi: string,
  ministry: string,
  category: string[],
  benefit: {
    type: string,
    amount: number,
    description: string,
    frequency: string
  },
  eligibility: {
    plainText: string,
    plainTextHindi: string
  },
  application: {
    mode: string[],
    portal: string,
    office: string,
    steps: string[],
    stepsHindi: string[]
  },
  documents: [
    { name: string, nameHindi: string, required: boolean, tip: string }
  ],
  personalised: {                 // only if sessionId provided
    documentChecklist: string[],  // filtered to what THIS user needs
    likelyApprovalTime: string,
    tips: string[]
  },
  lastVerified: string
}

---

## POST /report/generate
Generate PDF report for a session.

Request: { sessionId: string }

Response:
{
  reportUrl: string,    // S3 presigned URL, valid 24h
  sessionId: string
}

---

## Error Format (all endpoints)
{
  error: true,
  code: "SESSION_NOT_FOUND" | "QUIZ_INCOMPLETE" | "AI_ERROR" | "INVALID_INPUT",
  message: string
}
