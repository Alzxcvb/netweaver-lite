const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/contacts
router.get('/', async (req, res) => {
  try {
    const { search, tag } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { customFields: { some: { value: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: { socialLinks: true, customFields: true },
      orderBy: { name: 'asc' },
    });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contacts
router.post('/', async (req, res) => {
  try {
    const { socialLinks, customFields, ...data } = req.body;

    const contact = await prisma.contact.create({
      data: {
        ...data,
        socialLinks: socialLinks ? { create: socialLinks } : undefined,
        customFields: customFields ? { create: customFields } : undefined,
      },
      include: { socialLinks: true, customFields: true, interactions: true },
    });

    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        socialLinks: true,
        customFields: true,
        interactions: { orderBy: { date: 'desc' } },
      },
    });

    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contacts/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { socialLinks, customFields, ...data } = req.body;

    // Replace social links and custom fields
    if (socialLinks !== undefined) {
      await prisma.socialLink.deleteMany({ where: { contactId: id } });
    }
    if (customFields !== undefined) {
      await prisma.customField.deleteMany({ where: { contactId: id } });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...data,
        socialLinks: socialLinks ? { create: socialLinks } : undefined,
        customFields: customFields ? { create: customFields } : undefined,
      },
      include: {
        socialLinks: true,
        customFields: true,
        interactions: { orderBy: { date: 'desc' } },
      },
    });

    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.contact.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
