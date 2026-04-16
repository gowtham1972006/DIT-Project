import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, PeerSession } from '@/lib/db';

function makeSessionId() {
  return 'PEER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Student creates a new peer session
export async function POST(req) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Only students can request peer support.' }, { status: 401 });
  }

  await connectDB();

  // Reuse an existing waiting/active session for this student
  const existing = await PeerSession.findOne({
    student_id: session.id,
    status: { $in: ['waiting', 'active'] },
  });
  if (existing) {
    return NextResponse.json({ session_id: existing.session_id, existing: true });
  }

  const body = await req.json().catch(() => ({}));
  const topic = (body.topic || 'General Support').slice(0, 80);

  const ps = await PeerSession.create({
    session_id:      makeSessionId(),
    student_id:      session.id,
    student_anon_id: session.anonymous_id || 'Anonymous',
    topic,
    status:          'waiting',
  });

  return NextResponse.json({ session_id: ps.session_id });
}

// Approved peer fetches the list of waiting sessions
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'peer' || session.status !== 'approved') {
    return NextResponse.json({ error: 'Approved peer supporters only.' }, { status: 401 });
  }

  await connectDB();

  const sessions = await PeerSession.find({ status: 'waiting' })
    .sort({ created_at: 1 })
    .lean();

  return NextResponse.json({
    sessions: sessions.map(s => ({
      session_id:      s.session_id,
      student_anon_id: s.student_anon_id,
      topic:           s.topic,
      created_at:      s.created_at,
    })),
  });
}
