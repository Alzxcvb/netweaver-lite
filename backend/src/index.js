const express = require('express');
const cors = require('cors');

const contactsRouter = require('./routes/contacts');
const interactionsRouter = require('./routes/interactions');
const followUpRulesRouter = require('./routes/followUpRules');
const feedbackRouter = require('./routes/feedback');
const dashboardRouter = require('./routes/dashboard');
const importRouter = require('./routes/importContacts');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/contacts', contactsRouter);
app.use('/api/contacts', interactionsRouter);
app.use('/api/follow-up-rules', followUpRulesRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/import', importRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`NetWeaver Lite API running on http://localhost:${PORT}`);
});
