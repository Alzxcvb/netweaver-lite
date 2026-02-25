const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Default contact
  const existing = await prisma.contact.findFirst({ where: { name: 'John Doe' } });
  if (!existing) {
    await prisma.contact.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0100',
        birthday: '03-15',
        notes: 'Sample contact. Edit or delete me.',
        tags: ['friend', 'sample'],
        followUpInterval: 30,
        socialLinks: {
          create: [
            { platform: 'instagram', handle: '@johndoe', url: 'https://instagram.com/johndoe' },
          ],
        },
      },
    });
    console.log('Created sample contact: John Doe');
  }

  // Default follow-up rules
  const ruleNames = ['Birthday', "New Year's Day", 'Christmas'];
  for (const name of ruleNames) {
    const exists = await prisma.followUpRule.findFirst({ where: { name } });
    if (!exists) {
      let data = { name, messageTemplate: `Happy ${name}! Thinking of you.` };
      if (name === 'Birthday') {
        data.triggerType = 'birthday';
      } else if (name === "New Year's Day") {
        data.triggerType = 'holiday';
        data.triggerDate = '01-01';
        data.holidayName = "New Year's Day";
      } else if (name === 'Christmas') {
        data.triggerType = 'holiday';
        data.triggerDate = '12-25';
        data.holidayName = 'Christmas';
      }
      await prisma.followUpRule.create({ data });
      console.log(`Created rule: ${name}`);
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
