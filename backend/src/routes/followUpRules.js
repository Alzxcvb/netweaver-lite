const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/follow-up-rules
router.get('/', async (req, res) => {
  try {
    const rules = await prisma.followUpRule.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/follow-up-rules
router.post('/', async (req, res) => {
  try {
    const rule = await prisma.followUpRule.create({ data: req.body });
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/follow-up-rules/:id
router.put('/:id', async (req, res) => {
  try {
    const rule = await prisma.followUpRule.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/follow-up-rules/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.followUpRule.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
