const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

function todayMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const today = todayMMDD();
    const now = new Date();

    const [totalContacts, allContacts, rules] = await Promise.all([
      prisma.contact.count(),
      prisma.contact.findMany({
        include: { socialLinks: true },
      }),
      prisma.followUpRule.findMany(),
    ]);

    const followUpsToday = [];
    const overdue = [];

    for (const contact of allContacts) {
      // Birthday check
      if (contact.birthday && contact.birthday === today) {
        followUpsToday.push({ contact, reason: 'Birthday today!' });
        continue;
      }

      // Interval check
      if (contact.followUpInterval && contact.lastInteraction) {
        const lastDate = new Date(contact.lastInteraction);
        const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (daysSince >= contact.followUpInterval) {
          const payload = { contact, reason: `${daysSince} days since last contact (every ${contact.followUpInterval}d)` };
          if (daysSince > contact.followUpInterval) {
            overdue.push(payload);
          } else {
            followUpsToday.push(payload);
          }
          continue;
        }
      } else if (contact.followUpInterval && !contact.lastInteraction) {
        overdue.push({ contact, reason: `Never contacted (follow-up every ${contact.followUpInterval}d)` });
        continue;
      }

      // Rule-based: holiday / tag_event
      for (const rule of rules) {
        if (rule.triggerType === 'holiday' || rule.triggerType === 'tag_event') {
          const ruleDate = rule.holidayDate || rule.triggerDate;
          if (ruleDate && ruleDate === today) {
            if (!rule.tagFilter || contact.tags.includes(rule.tagFilter)) {
              followUpsToday.push({ contact, reason: `Rule: ${rule.name}` });
              break;
            }
          }
        }
      }
    }

    res.json({
      totalContacts,
      followUpsTodayCount: followUpsToday.length,
      overdueCount: overdue.length,
      followUpsToday,
      overdue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
