import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'TEACHER' || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbMaterials = await prisma.material.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' }
    });

    const materials = dbMaterials.map((m: any) => ({
      id: m.id,
      name: m.title,
      class: 'All Classes',
      type: m.type.toUpperCase(),
      size: '1.5 MB',
      date: m.createdAt.toISOString().split('T')[0],
      url: m.url,
      sectionSubjectId: 'GENERAL'
    }));

    // Fetch and construct sectionSubjects dropdown list
    let sectionSubjects: any[] = [];
    if (schoolId) {
      const classRooms = await prisma.classRoom.findMany({
        where: { schoolId }
      });
      const subjects = await prisma.subject.findMany({
        where: { schoolId }
      });

      for (const cls of classRooms) {
        for (const sub of subjects) {
          if (cls.standard === sub.standard) {
            sectionSubjects.push({
              id: sub.id,
              section: {
                id: cls.id,
                name: cls.section,
                class: {
                  id: cls.id,
                  name: cls.name
                }
              },
              subject: {
                id: sub.id,
                name: sub.name
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ materials, sectionSubjects });
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'TEACHER' || !teacherId || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, type, url } = data;

    const material = await prisma.material.create({
      data: {
        schoolId,
        teacherId,
        title: name || 'Untitled Material',
        type: type || 'pdf',
        url: url || '#'
      }
    });

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;

    if (!session || userRole !== 'TEACHER' || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    // Verify material belongs to this teacher
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material || material.teacherId !== teacherId) {
      return NextResponse.json({ error: 'Material not found or unauthorized' }, { status: 404 });
    }

    await prisma.material.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
