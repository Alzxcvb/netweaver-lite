const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/query
 *
 * Natural query endpoint for the OpenClaw skill.
 * Supported params:
 *   ?city=Berlin
 *   ?country=Germany
 *   ?tag=veteran
 *   ?date=11-11          (MM-DD) — contacts with follow-up rules matching that date
 *   ?birthday=today      — contacts whose birthday is today (or ?birthday=03-15)
 *   ?overdue=true        — contacts past their follow-up interval
 *   ?search=<text>       — general name/email/tag search
 */
router.get('/', async (req, res) => {
  try {
    const { city, country, tag, date, birthday, overdue, search } = req.query;

    const where = {};

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (birthday) {
      const mmdd = birthday === 'today' ? todayMMDD() : birthday;
      where.birthday = mmdd;
    }

    let contacts = await prisma.contact.findMany({
      where,
      include: { socialLinks: true },
      orderBy: { name: 'asc' },
    });

    // Overdue filter (post-query)
    if (overdue === 'true') {
      const now = Date.now();
      contacts = contacts.filter((c) => {
        if (!c.followUpInterval) return false;
        if (!c.lastInteraction) return true; // never contacted
        const daysSince = Math.floor((now - new Date(c.lastInteraction)) / (1000 * 60 * 60 * 24));
        return daysSince > c.followUpInterval;
      });
    }

    // Date-based: find contacts matched by any follow-up rule on that date
    if (date) {
      const rules = await prisma.followUpRule.findMany();
      const matchingRules = rules.filter((r) => {
        const ruleDate = r.holidayDate || r.triggerDate;
        return ruleDate === date;
      });

      if (matchingRules.length > 0) {
        // For birthday rules: contacts whose birthday matches
        // For holiday/tag_event rules: contacts matching tag filter
        const birthdayRule = matchingRules.find((r) => r.triggerType === 'birthday');
        const otherRules = matchingRules.filter((r) => r.triggerType !== 'birthday');

        const allContacts = await prisma.contact.findMany({ include: { socialLinks: true } });
        const matched = new Map();

        if (birthdayRule) {
          allContacts
            .filter((c) => c.birthday === date)
            .forEach((c) => matched.set(c.id, { ...c, matchedRule: birthdayRule.name }));
        }

        for (const rule of otherRules) {
          allContacts
            .filter((c) => !rule.tagFilter || c.tags.includes(rule.tagFilter))
            .forEach((c) => matched.set(c.id, { ...c, matchedRule: rule.name }));
        }

        return res.json({
          count: matched.size,
          contacts: [...matched.values()],
          matchedRules: matchingRules.map((r) => r.name),
        });
      }
    }

    res.json({
      count: contacts.length,
      contacts: contacts.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        country: c.country,
        tags: c.tags,
        birthday: c.birthday,
        lastInteraction: c.lastInteraction,
        followUpInterval: c.followUpInterval,
        socialLinks: c.socialLinks,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function todayMMDD() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

module.exports = router;
