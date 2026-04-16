import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, PeerSession, PeerMessage } from '@/lib/db';

// GET /api/peer-session/[sessionId] — session info + message history
export async function GET(req, { params }) {
  const { sessionId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const ps = await PeerSession.findOne({ session_id: sessionId }).lean();
  if (!ps) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  // Access control
  if (session.role === 'student' && ps.student_id !== session.id) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }
  if (session.role === 'peer') {
    if (session.status !== 'approved') {
      return NextResponse.json({ error: 'Peer not approved.' }, { status: 403 });
    }
    // Peer can view waiting sessions or their own active session
    if (ps.status === 'active' && ps.peer_id && ps.peer_id !== session.id) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }
  }

  const messages = await PeerMessage.find({ session_id: sessionId })
    .sort({ timestamp: 1 })
    .lean();

  return NextResponse.json({
    session: {
      session_id:      ps.session_id,
      student_anon_id: ps.student_anon_id,
      topic:           ps.topic,
      status:          ps.status,
      created_at:      ps.created_at,
    },
    viewer_role:  session.role,
    viewer_label: session.role === 'student'
      ? (session.anonymous_id || 'Anonymous Student')
      : 'Peer Supporter',
    messages: messages.map(m => ({
      id:           m._id.toString(),
      session_id:   m.session_id,
      sender_role:  m.sender_role,
      sender_label: m.sender_label,
      content:      m.content,
      timestamp:    m.timestamp,
    })),
  });
}

// PATCH /api/peer-session/[sessionId] — peer accepts a waiting session (atomic)
export async function PATCH(req, { params }) {
  const { sessionId } = await params;
  const session = await getSession();
  if (!session || session.role !== 'peer' || session.status !== 'approved') {
    return NextResponse.json({ error: 'Approved peer supporters only.' }, { status: 401 });
  }

  await connectDB();

  // Atomic: only update if still waiting (prevents two peers accepting same session)
  const updated = await PeerSession.findOneAndUpdate(
    { session_id: sessionId, status: 'waiting' },
    { peer_id: session.id, status: 'active' },
    { new: true }
  );

  if (!updated) {
    // Check if this peer already owns it
    const existing = await PeerSession.findOne({ session_id: sessionId, peer_id: session.id });
    if (existing) return NextResponse.json({ success: true, session_id: sessionId });
    return NextResponse.json({ error: 'Session is no longer available.' }, { status: 409 });
  }

  return NextResponse.json({ success: true, session_id: sessionId });
}
