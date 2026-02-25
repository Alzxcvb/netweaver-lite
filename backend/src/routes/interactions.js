const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/contacts/:id/interactions
router.get('/:id/interactions', async (req, res) => {
  try {
    const interactions = await prisma.interaction.findMany({
      where: { contactId: parseInt(req.params.id) },
      orderBy: { date: 'desc' },
    });
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contacts/:id/interactions
router.post('/:id/interactions', async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);

    const interaction = await prisma.interaction.create({
      data: { ...req.body, contactId },
    });

    // Update lastInteraction on contact
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastInteraction: interaction.date },
    });

    res.status(201).json(interaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
