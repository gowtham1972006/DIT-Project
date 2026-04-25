import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, PeerSession } from '@/lib/db';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/peer-session/[sessionId]/status
// Returns the current session status so clients can detect peer joining or
// session being closed (used during the 'waiting' phase, before chat opens).
// ─────────────────────────────────────────────────────────────────────────────
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
  if (session.role === 'peer' && session.status !== 'approved') {
    return NextResponse.json({ error: 'Peer not approved.' }, { status: 403 });
  }

  return NextResponse.json({ status: ps.status });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/peer-session/[sessionId]/status
// Body: { action: 'join' | 'end' }
//
//   action='join'  — approved peer accepts a waiting session (atomic, prevents
//                    two peers racing to claim the same session)
//   action='end'   — student or peer ends the session (marks it 'closed')
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(req, { params }) {
  const { sessionId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const body = await req.json().catch(() => ({}));
  const action = body.action;

  // ── action: join ────────────────────────────────────────────────────────────
  if (action === 'join') {
    if (session.role !== 'peer' || session.status !== 'approved') {
      return NextResponse.json({ error: 'Approved peer supporters only.' }, { status: 401 });
    }

    // Atomic update: only succeeds if session is still 'waiting'
    const updated = await PeerSession.findOneAndUpdate(
      { session_id: sessionId, status: 'waiting' },
      { peer_id: session.id, status: 'active' },
      { new: true }
    );

    if (!updated) {
      // Check if this peer already owns it
      const existing = await PeerSession.findOne({ session_id: sessionId, peer_id: session.id });
      if (existing) return NextResponse.json({ success: true, status: existing.status });
      return NextResponse.json({ error: 'Session is no longer available.' }, { status: 409 });
    }

    return NextResponse.json({ success: true, status: updated.status });
  }

  // ── action: end ─────────────────────────────────────────────────────────────
  if (action === 'end') {
    const ps = await PeerSession.findOne({ session_id: sessionId }).lean();
    if (!ps) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

    // Only the student who owns it or the assigned peer can end it
    if (session.role === 'student' && ps.student_id !== session.id) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }
    if (session.role === 'peer' && ps.peer_id && ps.peer_id !== session.id) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    await PeerSession.findOneAndUpdate({ session_id: sessionId }, { status: 'closed' });
    return NextResponse.json({ success: true, status: 'closed' });
  }

  return NextResponse.json({ error: 'Invalid action. Use "join" or "end".' }, { status: 400 });
}
