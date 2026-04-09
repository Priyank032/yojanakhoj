require('dotenv').config();
const express = require('express');
const cors = require('cors');

const quiz = require('./functions/quiz/handler');
const matcher = require('./functions/matcher/handler');
const report = require('./functions/report/handler');
const schemes = require('./functions/schemes/handler');
const whatsapp = require('./functions/whatsapp/handler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Twilio sends form-encoded

// Wrap Lambda handlers as Express routes
const wrap = (fn) => async (req, res) => {
  const event = {
    body: JSON.stringify(req.body),
    pathParameters: req.params,
    queryStringParameters: req.query,
  };
  try {
    const result = await fn(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: true, code: 'SERVER_ERROR', message: e.message });
  }
};

app.post('/quiz/start',         wrap(quiz.start));
app.post('/quiz/answer',        wrap(quiz.answer));
app.post('/match/schemes',      wrap(matcher.match));
app.get('/schemes/:schemeId',   wrap(schemes.getScheme));
app.post('/report/generate',    wrap(report.generate));

// WhatsApp webhook — handles its own response (not wrapped)
app.post('/whatsapp/incoming',  whatsapp.incoming);

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`\n🚀 Dev server running at http://localhost:${PORT}\n`));
