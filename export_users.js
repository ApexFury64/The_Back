const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportUsers() {
  const users = await prisma.user.findMany({
    select: {
      role: true,
      name: true,
      email: true,
    },
    orderBy: [
      { role: 'asc' },
      { name: 'asc' }
    ]
  });

  const formattedUsers = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push({ name: user.name, email: user.email, defaultPassword: 'password123' });
    return acc;
  }, {});

  fs.writeFileSync('platform_logins.json', JSON.stringify(formattedUsers, null, 2));
  console.log('Successfully exported logins to platform_logins.json');
}

exportUsers().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
