import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Curriculum data keyed by subject → standard → modules with real topic names and icons
const curriculumData: Record<string, Record<number, { title: string; topics: { title: string; icon: string }[] }[]>> = {
  Mathematics: {
    6: [
      { title: 'Numbers & Integers', topics: [
        { title: 'Whole Numbers', icon: 'hash' },
        { title: 'Playing with Numbers', icon: 'dices' },
        { title: 'Negative Numbers & Integers', icon: 'minus-circle' },
      ]},
      { title: 'Geometry & Shapes', topics: [
        { title: 'Basic Geometrical Ideas', icon: 'triangle' },
        { title: 'Symmetry', icon: 'flip-horizontal' },
        { title: 'Practical Geometry', icon: 'ruler' },
      ]},
      { title: 'Fractions & Decimals', topics: [
        { title: 'Fractions', icon: 'divide' },
        { title: 'Decimals', icon: 'percent' },
      ]},
    ],
    7: [
      { title: 'Algebra & Equations', topics: [
        { title: 'Algebraic Expressions', icon: 'variable' },
        { title: 'Simple Equations', icon: 'equal' },
        { title: 'Exponents & Powers', icon: 'superscript' },
      ]},
    ],
    8: [
      { title: 'Linear Equations', topics: [
        { title: 'Linear Equations in One Variable', icon: 'trending-up' },
        { title: 'Graphing Linear Equations', icon: 'line-chart' },
      ]},
      { title: 'Quadrilaterals & Polygons', topics: [
        { title: 'Understanding Quadrilaterals', icon: 'square' },
        { title: 'Polygons & Angle Sums', icon: 'hexagon' },
      ]},
    ],
    9: [
      { title: 'Number Systems', topics: [
        { title: 'Real Numbers', icon: 'infinity' },
        { title: 'Irrational Numbers', icon: 'sigma' },
      ]},
    ],
    10: [
      { title: 'Algebra III', topics: [
        { title: 'Quadratic Equations', icon: 'square-function' },
        { title: 'Arithmetic Progressions', icon: 'list-ordered' },
      ]},
    ],
  },
  Science: {
    6: [
      { title: 'Food & Nutrition', topics: [
        { title: 'Components of Food', icon: 'apple' },
        { title: 'Sources of Food', icon: 'wheat' },
      ]},
    ],
    7: [
      { title: 'Physical & Chemical Changes', topics: [
        { title: 'Physical vs Chemical Changes', icon: 'flask-conical' },
        { title: 'Acids, Bases & Salts', icon: 'test-tubes' },
      ]},
    ],
    8: [
      { title: 'Force & Pressure', topics: [
        { title: 'Force & Friction', icon: 'move' },
        { title: 'Pressure in Fluids', icon: 'droplets' },
      ]},
    ],
    9: [
      { title: 'Matter & Its Properties', topics: [
        { title: 'Matter in Our Surroundings', icon: 'atom' },
        { title: 'Is Matter Around Us Pure?', icon: 'beaker' },
      ]},
    ],
    10: [
      { title: 'Chemical Reactions', topics: [
        { title: 'Chemical Reactions & Equations', icon: 'flask-conical' },
        { title: 'Acids, Bases & Salts', icon: 'test-tubes' },
      ]},
    ],
  },
  English: {
    10: [
      { title: 'Grammar Mastery', topics: [
        { title: 'Tenses — All Forms', icon: 'clock' },
        { title: 'Reported Speech & Clauses', icon: 'message-square' },
      ]},
    ]
  }
};

export async function GET() {
  try {
    const schoolId = 'cm3k41g2g00004o4a77vw9wz8'; // Use the main school ID or hardcode one
    // Let's just find the first school
    const school = await prisma.school.findFirst();
    if (!school) return NextResponse.json({ error: 'No school found' }, { status: 400 });

    const actualSchoolId = school.id;
    let createdTopicsCount = 0;

    // Loop through standards
    for (const [subjectName, standards] of Object.entries(curriculumData)) {
      for (const [standardStr, modules] of Object.entries(standards)) {
        const std = parseInt(standardStr);

        // Find or create Subject
        const subjectCode = `${subjectName.substring(0, 3).toUpperCase()}${std}`;
        let subject = await prisma.subject.findFirst({
          where: { schoolId: actualSchoolId, standard: std.toString(), name: subjectName }
        });

        if (!subject) {
          subject = await prisma.subject.create({
            data: {
              schoolId: actualSchoolId,
              name: subjectName,
              code: subjectCode,
              color: '#00d4aa',
              standard: std.toString()
            }
          });
        }

        // Loop through modules -> topics
        for (const module of modules) {
          for (let i = 0; i < module.topics.length; i++) {
            const topicData = module.topics[i];
            
            // Check if topic exists
            const existingTopic = await prisma.topic.findFirst({
              where: {
                subjectId: subject.id,
                title: topicData.title
              }
            });

            if (!existingTopic) {
              await prisma.topic.create({
                data: {
                  subjectId: subject.id,
                  title: topicData.title,
                  icon: topicData.icon,
                  order: i
                }
              });
              createdTopicsCount++;
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: `Created ${createdTopicsCount} topics.` });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
