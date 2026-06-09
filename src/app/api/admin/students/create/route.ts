import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  classId: z.string().min(2),
  studentPassword: z.preprocess((val) => (val === '' || val === null || val === undefined) ? undefined : val, z.string().min(6).optional()),
  parentName: z.preprocess((val) => (val === '' || val === null || val === undefined) ? undefined : val, z.string().optional()),
  parentEmail: z.preprocess((val) => (val === '' || val === null || val === undefined) ? undefined : val, z.string().email().optional()),
  parentPhone: z.preprocess((val) => (val === '' || val === null || val === undefined) ? undefined : val, z.string().optional()),
  parentPassword: z.preprocess((val) => (val === '' || val === null || val === undefined) ? undefined : val, z.string().min(6).optional()),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    
    const { 
      name, 
      email, 
      classId, 
      studentPassword,
      parentName,
      parentEmail,
      parentPhone,
      parentPassword
    } = parsed.data;
    
    const schoolId = (session.user as any).schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 403 });
    }

    // Verify class belongs to this school
    const classRoom = await prisma.classRoom.findFirst({
      where: { id: classId, schoolId }
    });
    if (!classRoom) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if student email already exists (case-insensitive)
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash student password
    const finalStudentPassword = studentPassword && studentPassword.trim().length > 0
      ? studentPassword
      : 'password123';
    const hashedStudentPassword = await bcrypt.hash(finalStudentPassword, 10);

    // Link/create parent if email is provided
    let parentId: string | undefined = undefined;
    if (parentEmail && parentEmail.trim().length > 0) {
      let parentUser = await prisma.user.findFirst({
        where: { email: { equals: parentEmail, mode: 'insensitive' } }
      });

      if (!parentUser) {
        // If parent password is not specified, use same password as student
        const finalParentPassword = parentPassword && parentPassword.trim().length > 0
          ? parentPassword
          : finalStudentPassword;
        const hashedParentPassword = await bcrypt.hash(finalParentPassword, 10);

        parentUser = await prisma.user.create({
          data: {
            name: parentName && parentName.trim().length > 0 ? parentName : `Parent of ${name}`,
            email: parentEmail,
            phone: parentPhone && parentPhone.trim().length > 0 ? parentPhone : null,
            password: hashedParentPassword,
            role: 'PARENT',
            schoolId
          }
        });
      } else {
        // Parent already exists, verify role
        if (parentUser.role !== 'PARENT') {
          return NextResponse.json({ error: 'User with parent email already exists and is not a parent account.' }, { status: 400 });
        }
        
        // Optionally update phone if provided
        if (parentPhone && parentPhone.trim().length > 0) {
          parentUser = await prisma.user.update({
            where: { id: parentUser.id },
            data: { phone: parentPhone }
          });
        }
      }
      parentId = parentUser.id;
    }

    const newStudent = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedStudentPassword,
        role: 'STUDENT',
        schoolId,
        classId,
        parentId
      }
    });

    return NextResponse.json({ 
      success: true, 
      student: { 
        id: newStudent.id, 
        name: newStudent.name, 
        email: newStudent.email,
        parentId: newStudent.parentId
      } 
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
