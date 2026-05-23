import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assignmentId = formData.get('assignmentId') as string;
    const userEmail = formData.get('userEmail') as string;
    const comments = formData.get('comments') as string;

    if (!file || !assignmentId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const userId = user.id;

    // Save physical file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    const relativePath = `/uploads/${uniqueFilename}`;

    // Update DB
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        userId_assignmentId: {
          userId,
          assignmentId
        }
      },
      update: {
        filePath: relativePath,
        comments,
        status: 'submitted',
        submittedAt: new Date()
      },
      create: {
        userId,
        assignmentId,
        filePath: relativePath,
        comments,
        status: 'submitted'
      }
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
