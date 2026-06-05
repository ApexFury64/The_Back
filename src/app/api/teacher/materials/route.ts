import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;

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
      class: 'All Classes', // TODO: Add classId to Material schema
      type: m.type.toUpperCase(),
      size: '1.5 MB', // TODO: Store file size in Material schema
      date: m.createdAt.toISOString().split('T')[0],
      sectionSubjectId: 'GENERAL'
    }));

    return NextResponse.json({ materials, sectionSubjects: [] });
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
