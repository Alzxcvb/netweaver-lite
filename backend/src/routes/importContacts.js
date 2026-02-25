const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/import/preview — parse CSV, return rows with duplicate suggestions
router.post('/preview', upload.single('file'), async (req, res) => {
  try {
    const csvText = req.file.buffer.toString('utf8');
    const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

    const existing = await prisma.contact.findMany({ select: { id: true, name: true, email: true } });

    const results = rows.map((row) => {
      const name = row.name || row.Name || row.full_name || '';
      const email = row.email || row.Email || '';

      // Duplicate detection: exact name match (case-insensitive) or email match
      const match = existing.find(
        (c) =>
          (name && c.name.toLowerCase() === name.toLowerCase()) ||
          (email && c.email && c.email.toLowerCase() === email.toLowerCase())
      );

      return {
        row,
        parsedName: name,
        parsedEmail: email,
        matchedContact: match || null,
        action: match ? 'merge' : 'create', // user can override
      };
    });

    res.json({ count: rows.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/import/confirm — user-confirmed import
router.post('/confirm', async (req, res) => {
  try {
    const { rows } = req.body;
    // rows: [{ action: 'create'|'merge'|'skip', matchedContactId, data: {...} }]

    let created = 0;
    let merged = 0;
    let skipped = 0;

    for (const item of rows) {
      if (item.action === 'skip') {
        skipped++;
        continue;
      }

      const contactData = {
        name: item.data.name || item.data.Name || '',
        email: item.data.email || item.data.Email || undefined,
        phone: item.data.phone || item.data.Phone || undefined,
        notes: item.data.notes || item.data.Notes || undefined,
        tags: item.data.tags ? item.data.tags.split(',').map((t) => t.trim()) : [],
      };

      if (item.action === 'merge' && item.matchedContactId) {
        await prisma.contact.update({
          where: { id: item.matchedContactId },
          data: contactData,
        });
        merged++;
      } else {
        await prisma.contact.create({ data: contactData });
        created++;
      }
    }

    res.json({ created, merged, skipped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
