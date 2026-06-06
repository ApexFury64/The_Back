import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbSubjects = await prisma.subject.findMany({
      where: { schoolId },
    });

    const subjects = dbSubjects.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      category: 'Core', // TODO: Add category to Prisma schema
      description: `Course for ${sub.name}`, // TODO: Add description to Prisma schema
      grade: parseInt(sub.standard, 10) || 0,
      color: sub.color
    }));

    return NextResponse.json({ subjects });
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, standard, code, color } = body;

    if (!name || !standard) {
      return NextResponse.json({ error: 'Name and standard are required' }, { status: 400 });
    }

    // Check if subject already exists for this standard in the school (case-insensitive)
    const existingSubject = await prisma.subject.findFirst({
      where: {
        schoolId,
        name: { equals: name, mode: 'insensitive' },
        standard: standard.toString(),
      }
    });

    if (existingSubject) {
      return NextResponse.json({ error: 'Subject already exists for this standard' }, { status: 400 });
    }

    const subjectCode = code || (name.substring(0, 3).toUpperCase() + standard);
    const subjectColor = color || '#0ea5e9';

    const subject = await prisma.subject.create({
      data: {
        name,
        code: subjectCode,
        color: subjectColor,
        standard: standard.toString(),
        schoolId,
      }
    });

    return NextResponse.json({ success: true, subject });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, code, color, standard } = body;

    if (!id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    // Verify the subject belongs to the school
    const existingSubject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!existingSubject || existingSubject.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Update subject details
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        name: name || undefined,
        code: code || undefined,
        color: color || undefined,
        standard: standard ? standard.toString() : undefined
      }
    });

    return NextResponse.json({ success: true, subject: updatedSubject });
  } catch (error: any) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    // Verify the subject belongs to the school
    const existingSubject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!existingSubject || existingSubject.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Delete subject
    await prisma.subject.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

