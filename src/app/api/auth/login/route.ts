import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createSession } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';

// In-memory Rate Limiter
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) return false;
  record.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Try again in 1 minute.' }, { status: 429 });
    }

    const body = await request.json();
    const { idToken, role } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    // Verify the Firebase ID token using the Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    }

    // Attempt to fetch user details from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    let name = email.split('@')[0];
    let userRole = role;
    let schoolId = null;
    let schoolName = "Firebase Default School";

    if (userDoc.exists) {
      const data = userDoc.data();
      name = data?.name || name;
      userRole = data?.role || role;
      schoolId = data?.schoolId || null;
      if (schoolId) {
        const schoolDoc = await adminDb.collection('schools').doc(schoolId).get();
        if (schoolDoc.exists) {
          schoolName = schoolDoc.data()?.name || schoolName;
        }
      }
    } else {
      // Create user in Firestore if they don't exist yet
      await adminDb.collection('users').doc(uid).set({
        email,
        name,
        role: userRole,
        createdAt: new Date().toISOString()
      });
    }

    // Create the session cookie
    await createSession({
      userId: uid,
      email: email,
      role: userRole,
      schoolId: schoolId || ''
    });

    return NextResponse.json({ 
      success: true, 
      role: userRole, 
      name, 
      email,
      schoolId: schoolId || '',
      schoolName 
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Invalid login' }, { status: 401 });
  }
}
