import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const parseCSVLine = (line: string) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      return NextResponse.json({ error: 'CSV file is empty or missing data rows' }, { status: 400 });
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    
    // Find header indices
    const studentNameIdx = headers.findIndex(h => h.includes('student name') || h === 'name');
    const studentEmailIdx = headers.findIndex(h => h.includes('student email') || h === 'email');
    const studentPasswordIdx = headers.findIndex(h => h.includes('student password') || h === 'password');
    const standardIdx = headers.findIndex(h => h.includes('standard') || h === 'grade' || h === 'class');
    const sectionIdx = headers.findIndex(h => h.includes('section'));
    const parentNameIdx = headers.findIndex(h => h.includes('parent name'));
    const parentEmailIdx = headers.findIndex(h => h.includes('parent email'));
    const parentPhoneIdx = headers.findIndex(h => h.includes('parent phone') || h.includes('parent mobile') || h === 'phone');
    const parentPasswordIdx = headers.findIndex(h => h.includes('parent password'));

    if (studentNameIdx === -1 || studentEmailIdx === -1 || standardIdx === -1 || sectionIdx === -1) {
      return NextResponse.json({ 
        error: 'Required headers missing in CSV. Required: "Student Name", "Student Email", "Standard", "Section"' 
      }, { status: 400 });
    }

    const defaultPassword = await bcrypt.hash('demo123', 10);
    const importedStudents = [];

    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      if (columns.length < 4) continue; // Skip malformed rows

      const studentName = columns[studentNameIdx];
      const studentEmail = columns[studentEmailIdx];
      const standard = columns[standardIdx];
      const section = columns[sectionIdx];
      const parentName = parentNameIdx !== -1 ? columns[parentNameIdx] : '';
      const parentEmail = parentEmailIdx !== -1 ? columns[parentEmailIdx] : '';
      const parentPhone = parentPhoneIdx !== -1 ? columns[parentPhoneIdx] : '';

      if (!studentName || !studentEmail || !standard || !section) continue;

      // Find or create class section
      let classRoom = await prisma.classRoom.findFirst({
        where: {
          schoolId,
          standard: standard.toString(),
          section: { equals: section, mode: 'insensitive' }
        }
      });

      if (!classRoom) {
        classRoom = await prisma.classRoom.create({
          data: {
            schoolId,
            name: `Class ${standard} - ${section.toUpperCase()}`,
            standard: standard.toString(),
            section: section.toUpperCase(),
          }
        });
      }

      // Hash student password if provided, else use default
      let studentHash = defaultPassword;
      if (studentPasswordIdx !== -1 && columns[studentPasswordIdx]?.trim()) {
        studentHash = await bcrypt.hash(columns[studentPasswordIdx].trim(), 10);
      }

      // Find or create student
      let studentUser = await prisma.user.findFirst({
        where: { email: { equals: studentEmail, mode: 'insensitive' } }
      });

      if (!studentUser) {
        studentUser = await prisma.user.create({
          data: {
            name: studentName,
            email: studentEmail,
            password: studentHash,
            role: 'STUDENT',
            schoolId,
            classId: classRoom.id
          }
        });
      } else {
        studentUser = await prisma.user.update({
          where: { id: studentUser.id },
          data: { classId: classRoom.id }
        });
      }

      // Find or create parent
      if (parentEmail) {
        let parentUser = await prisma.user.findFirst({
          where: { email: { equals: parentEmail, mode: 'insensitive' } }
        });

        // Hash parent password if provided, else use default
        let parentHash = defaultPassword;
        if (parentPasswordIdx !== -1 && columns[parentPasswordIdx]?.trim()) {
          parentHash = await bcrypt.hash(columns[parentPasswordIdx].trim(), 10);
        }

        if (!parentUser) {
          parentUser = await prisma.user.create({
            data: {
              name: parentName || `Parent of ${studentName}`,
              email: parentEmail,
              phone: parentPhone || null,
              password: parentHash,
              role: 'PARENT',
              schoolId
            }
          });
        } else if (parentPhone) {
          parentUser = await prisma.user.update({
            where: { id: parentUser.id },
            data: { phone: parentPhone }
          });
        }

        // Link student to parent
        await prisma.user.update({
          where: { id: studentUser.id },
          data: { parentId: parentUser.id }
        });
      }

      importedStudents.push({ id: studentUser.id, name: studentUser.name, email: studentUser.email });
    }

    return NextResponse.json({ success: true, count: importedStudents.length });
  } catch (error: any) {
    console.error('Error in bulk import:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
