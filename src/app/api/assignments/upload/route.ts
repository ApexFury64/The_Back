import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assignmentId = formData.get('assignmentId') as string;
    const userEmail = formData.get('userEmail') as string;
    const comments = formData.get('comments') as string;

    if (!file || !assignmentId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const student = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    let filePath = "";
    
    // Check if Vercel Blob is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
       // Upload to Vercel Blob
       const blob = await put(file.name, file, { access: 'public' });
       filePath = blob.url;
    } else {
       // Fallback to local storage
       const bytes = await file.arrayBuffer();
       const buffer = Buffer.from(bytes);

       const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
       
       try {
         await fs.access(uploadsDir);
       } catch {
         await fs.mkdir(uploadsDir, { recursive: true });
       }

       const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
       const localFilePath = path.join(uploadsDir, uniqueFilename);
       await fs.writeFile(localFilePath, buffer);

       filePath = `/uploads/${uniqueFilename}`;
    }

    // Update DB
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        studentId: student.id,
        assignmentId
      }
    });

    let submission;
    if (existingSubmission) {
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          filePath,
          comments,
          status: 'submitted',
          submittedAt: new Date()
        }
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          studentId: student.id,
          assignmentId,
          filePath,
          comments,
          status: 'submitted',
          submittedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
