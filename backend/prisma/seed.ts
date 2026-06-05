import { PrismaClient } from '@prisma/client';
import { gamificationService } from '../src/services/gamification.service';

const prisma = new PrismaClient();

const DEFAULT_TASKS = [
  {
    title: 'Join Telegram Channel',
    description: 'Join our official Telegram channel',
    reward: 100,
    type: 'telegram_channel',
    url: 'https://t.me/TRONMinerChannel',
  },
  {
    title: 'Join Telegram Group',
    description: 'Join our community group',
    reward: 75,
    type: 'telegram_group',
    url: 'https://t.me/TRONMinerGroup',
  },
  {
    title: 'Follow Twitter',
    description: 'Follow us on X (Twitter)',
    reward: 50,
    type: 'twitter',
    url: 'https://twitter.com/TRONMiner',
  },
  {
    title: 'Invite Friend',
    description: 'Invite a friend using your referral link',
    reward: 200,
    type: 'referral',
  },
];

async function main() {
  console.log('Seeding database...');

  await gamificationService.seedAchievements();
  console.log('Achievements seeded');

  for (const task of DEFAULT_TASKS) {
    const existing = await prisma.task.findFirst({
      where: { title: task.title },
    });

    if (!existing) {
      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          reward: task.reward,
          type: task.type,
          url: task.url,
        },
      });
    }
  }
  console.log('Tasks seeded');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
