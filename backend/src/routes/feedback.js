const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { message, category } = req.body;
    if (!message || !category) {
      return res.status(400).json({ error: 'message and category are required' });
    }
    const feedback = await prisma.feedback.create({ data: { message, category } });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback (admin view)
router.get('/', async (req, res) => {
  try {
    const items = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
