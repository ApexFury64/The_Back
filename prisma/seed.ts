import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create a Student User
  const arjun = await prisma.user.upsert({
    where: { email: 'arjun@techwing.com' },
    update: {},
    create: {
      name: 'Arjun Reddy',
      email: 'arjun@techwing.com',
      role: 'student'
    }
  })
  console.log('Created user:', arjun.name)

  // 2. Create Subjects
  const math = await prisma.subject.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      code: 'MATH',
      name: 'Mathematics',
      color: '#00d4aa',
      standard: 7
    }
  })

  const science = await prisma.subject.upsert({
    where: { code: 'SCI' },
    update: {},
    create: {
      code: 'SCI',
      name: 'Science',
      color: '#34d399',
      standard: 7
    }
  })
  
  // 3. Create Syllabus structure (Modules and Topics)
  const mathModule1 = await prisma.module.create({
    data: {
      title: 'Unit 1: Number System',
      subjectId: math.id,
      topics: {
        create: [
          { title: 'Integers: Addition and Subtraction' },
          { title: 'Integers: Multiplication and Division' },
          { title: 'Fractions and Decimals' }
        ]
      }
    },
    include: { topics: true }
  })

  const mathModule2 = await prisma.module.create({
    data: {
      title: 'Unit 2: Algebra & Data',
      subjectId: math.id,
      topics: {
        create: [
          { title: 'Data Handling' },
          { title: 'Simple Equations' },
          { title: 'Algebraic Expressions' }
        ]
      }
    },
    include: { topics: true }
  })

  // Set Progress for Math Topics
  // Let's complete unit 1, put unit 2 topic 1 in progress, and lock the rest.
  for (let i = 0; i < mathModule1.topics.length; i++) {
    await prisma.topicProgress.create({
      data: {
        userId: arjun.id,
        topicId: mathModule1.topics[i].id,
        status: 'completed'
      }
    })
  }

  await prisma.topicProgress.create({
    data: { userId: arjun.id, topicId: mathModule2.topics[0].id, status: 'completed' }
  })
  await prisma.topicProgress.create({
    data: { userId: arjun.id, topicId: mathModule2.topics[1].id, status: 'in-progress' }
  })
  await prisma.topicProgress.create({
    data: { userId: arjun.id, topicId: mathModule2.topics[2].id, status: 'locked' }
  })

  // 4. Create Quizzes and Questions
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Simple Equations Quiz',
      subjectId: math.id,
      difficulty: 'Medium',
      timeLimit: 20,
      questions: {
        create: [
          {
            text: 'If x + 5 = 12, what is the value of x?',
            options: JSON.stringify(['5', '7', '12', '17']),
            correctAnswer: 1
          },
          {
            text: 'Solve for y: 2y = 14',
            options: JSON.stringify(['2', '6', '7', '12']),
            correctAnswer: 2
          },
          {
            text: 'If 3z - 2 = 10, then z is:',
            options: JSON.stringify(['3', '4', '6', '12']),
            correctAnswer: 1
          }
        ]
      }
    }
  })
  console.log('Created Quiz:', quiz1.title)

  // 5. Create Pending Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Integers Mastery Worksheet',
      subjectId: math.id,
      dueDate: new Date(Date.now() + 86400000) // Tomorrow
    }
  })
  console.log('Created Assignment:', assignment1.title)

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
