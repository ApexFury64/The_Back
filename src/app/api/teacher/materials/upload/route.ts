import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'TEACHER' || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const sectionSubjectId = formData.get('sectionSubjectId') as string;

    if (!file || !title || !sectionSubjectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let url = '';
    
    // Upload to Vercel Blob if token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, { access: 'public' });
      url = blob.url;
    } else {
      return NextResponse.json({ error: 'Blob storage is not configured.' }, { status: 500 });
    }

    // Determine file type
    const fileType = file.name.endsWith('.pdf') ? 'PDF' 
                     : file.name.endsWith('.docx') ? 'Word' 
                     : file.name.endsWith('.mp4') ? 'Video'
                     : file.name.endsWith('.zip') ? 'Archive'
                     : 'Other';

    // Verify subject
    const subject = await prisma.subject.findUnique({
      where: { id: sectionSubjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    }

    const material = await prisma.material.create({
      data: {
        schoolId,
        teacherId,
        title,
        type: fileType,
        url,
      }
    });

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error('Error uploading material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
