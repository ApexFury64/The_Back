import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';
import { curriculumData } from '@/lib/labAssets';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    // Parse userEmail from query params or session
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('userEmail');
    const userEmail = queryEmail || session?.email || 'arjun@dps.edu';
    
    const schoolId = session?.schoolId || 'dps-001';
    
    // Fetch attempts from Firestore for this user
    const attemptsMap = new Map<string, any[]>();
    try {
      const attemptsSnapshot = await adminDb.collection('quizAttempts')
        .where('userEmail', '==', userEmail)
        .get();
      
      attemptsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const quizId = data.quizId;
        if (quizId) {
          if (!attemptsMap.has(quizId)) {
            attemptsMap.set(quizId, []);
          }
          attemptsMap.get(quizId)!.push({
            id: doc.id,
            score: data.score,
            timeTaken: data.timeTaken,
            completedAt: data.completedAt
          });
        }
      });
    } catch (e) {
      console.warn("Could not fetch attempts from Firestore", e);
    }
    
    // Generate quizzes based on curriculumData
    const generatedQuizzes: any[] = [];
    
    for (const [subjectName, standardsMap] of Object.entries(curriculumData)) {
      for (const [standard, modules] of Object.entries(standardsMap)) {
        modules.forEach((mod, modIdx) => {
          const difficulty = modIdx % 3 === 0 ? 'Hard' : (modIdx % 2 === 0 ? 'Medium' : 'Easy');
          const quizId = `gen-quiz-${subjectName}-${standard}-${modIdx}`;
          
          generatedQuizzes.push({
            id: quizId,
            title: `${mod.title} Assessment`,
            class: standard.toString(),
            subject: { name: subjectName },
            due: modIdx === 0 ? 'Tomorrow' : 'Next Week',
            timeLimit: 15 + (modIdx * 5),
            difficulty,
            attempts: attemptsMap.get(quizId) || [],
            _count: { questions: 5 }
          });
        });
      }
    }

    // Try fetching from database to see if we have school-specific quizzes
    let dbQuizzes: any[] = [];
    try {
      let quizzesQuery: any = adminDb.collection('quizzes');
      if (session && session.role !== 'super-admin') {
        quizzesQuery = quizzesQuery.where('schoolId', '==', schoolId);
      }
      
      const snapshot = await quizzesQuery.get();
      dbQuizzes = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          subject: { name: data.subject || 'Unknown' },
          _count: { questions: data.questions || 5 },
          attempts: attemptsMap.get(doc.id) || []
        };
      });
    } catch (e) {
      console.warn("Could not fetch DB quizzes, falling back to generated only.");
    }
    
    // Merge DB quizzes with generated quizzes
    const allQuizzes = [...dbQuizzes, ...generatedQuizzes];

    return NextResponse.json(allQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
