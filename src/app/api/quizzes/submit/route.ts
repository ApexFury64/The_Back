import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { curriculumData } from '@/lib/labAssets';
import { generateQuestions } from '@/lib/quizGenerator';

const submitQuizSchema = z.object({
  quizId: z.string().min(1),
  answers: z.record(z.string(), z.number()),
  timeTaken: z.number().optional(),
  userEmail: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitQuizSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    
    const { quizId, answers, timeTaken, userEmail } = parsed.data;

    let subjectName = 'Mathematics';
    let standard = 8;
    let title = 'General Revision';

    // 1. Get the quiz details to retrieve correct answers
    if (quizId.startsWith('gen-quiz-')) {
      const parts = quizId.split('-');
      subjectName = parts[2];
      standard = parseInt(parts[3]) || 8;
      const modIdx = parseInt(parts[4]) || 0;
      const moduleData = curriculumData[subjectName]?.[standard]?.[modIdx];
      if (moduleData) {
        title = moduleData.title;
      }
    } else {
      // Look up in Firestore
      try {
        const doc = await adminDb.collection('quizzes').doc(quizId).get();
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            subjectName = data.subject || 'Mathematics';
            title = data.title || 'General Revision';
            const standardStr = data.class ? data.class.replace(/[^0-9]/g, '') : '8';
            standard = parseInt(standardStr) || 8;
          }
        }
      } catch (e) {
        console.warn("Could not find quiz in Firestore during submission grading.", e);
      }
    }

    // 2. Generate the identical deterministic questions with correct answers
    const questions = generateQuestions(quizId, subjectName, standard, title);

    if (questions.length === 0) {
      return NextResponse.json({ error: 'Quiz has no questions' }, { status: 400 });
    }

    // 3. Grade the quiz
    let correctCount = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    }

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    // 4. Save attempt to Firestore 'quizAttempts' collection
    const attemptData = {
      quizId,
      userEmail,
      score: scorePercentage,
      timeTaken: timeTaken || 0,
      completedAt: new Date().toISOString()
    };

    const attemptDoc = await adminDb.collection('quizAttempts').add(attemptData);

    return NextResponse.json({
      score: scorePercentage,
      correctCount,
      totalQuestions: questions.length,
      attempt: {
        id: attemptDoc.id,
        ...attemptData
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
