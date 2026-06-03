const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportDetailedUsers() {
  const users = await prisma.user.findMany({
    include: {
      school: true,
      section: {
        include: { class: true }
      },
      children: {
        include: { section: { include: { class: true } } }
      },
      sectionSubjects: {
        include: { subject: true, section: { include: { class: true } } }
      },
      classTeacherOf: {
        include: { class: true }
      }
    },
    orderBy: [
      { role: 'asc' },
      { name: 'asc' }
    ]
  });

  const formattedUsers = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    
    let details = {
      name: user.name,
      email: user.email,
      defaultPassword: 'password123',
      school: user.school ? user.school.name : 'Platform Level'
    };

    if (user.role === 'student' && user.section) {
      details.class = `${user.section.class.name} - ${user.section.name}`;
      details.grade = user.section.class.grade;
    }

    if (user.role === 'parent' && user.children && user.children.length > 0) {
      details.children = user.children.map(c => 
        `${c.name} (${c.section ? `${c.section.class.name}-${c.section.name}` : 'No Class'})`
      );
    }

    if (user.role === 'teacher') {
      const subjects = user.sectionSubjects.map(ss => `${ss.subject.name} (${ss.section.class.name}-${ss.section.name})`);
      const classTeacher = user.classTeacherOf.map(s => `${s.class.name}-${s.name}`);
      if (subjects.length > 0) details.subjectsTaught = subjects;
      if (classTeacher.length > 0) details.classTeacherOf = classTeacher;
    }

    acc[user.role].push(details);
    return acc;
  }, {});

  fs.writeFileSync('C:/Users/TECHWING/.gemini/antigravity-ide/brain/236fe47a-8279-4766-a539-4513986a719b/detailed_platform_logins.json', JSON.stringify(formattedUsers, null, 2));
  console.log('Successfully exported detailed logins');
}

exportDetailedUsers().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
