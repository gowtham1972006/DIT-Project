import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, PeerSession, PeerMessage } from '@/lib/db';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: verify the caller can access this peer session
// Returns { ps, session } on success, or a NextResponse error on failure.
// ─────────────────────────────────────────────────────────────────────────────
async function authorize(sessionId) {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  await connectDB();
  const ps = await PeerSession.findOne({ session_id: sessionId }).lean();
  if (!ps) return { error: NextResponse.json({ error: 'Session not found.' }, { status: 404 }) };

  if (session.role === 'student' && ps.student_id !== session.id) {
    return { error: NextResponse.json({ error: 'Access denied.' }, { status: 403 }) };
  }
  if (session.role === 'peer') {
    if (session.status !== 'approved') {
      return { error: NextResponse.json({ error: 'Peer not approved.' }, { status: 403 }) };
    }
    // Block a different peer from reading an active session they don't own
    if (ps.status === 'active' && ps.peer_id && ps.peer_id !== session.id) {
      return { error: NextResponse.json({ error: 'Access denied.' }, { status: 403 }) };
    }
  }

  return { ps, session };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/peer-session/[sessionId]/messages?since=<ISO timestamp>
// Returns messages newer than `since` (for the client poll loop).
// Also returns current session status so the client can react to peer joining
// or session ending without a separate status poll.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req, { params }) {
  const { sessionId } = await params;
  const auth = await authorize(sessionId);
  if (auth.error) return auth.error;

  const { ps } = auth;
  const url = new URL(req.url);
  const since = url.searchParams.get('since');

  const query = { session_id: sessionId };
  if (since) {
    query.timestamp = { $gt: new Date(since) };
  }

  const messages = await PeerMessage.find(query).sort({ timestamp: 1 }).lean();

  return NextResponse.json({
    status: ps.status,
    messages: messages.map((m) => ({
      id:           m._id.toString(),
      session_id:   m.session_id,
      sender_role:  m.sender_role,
      sender_label: m.sender_label,
      content:      m.content,
      timestamp:    m.timestamp,
    })),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/peer-session/[sessionId]/messages
// Body: { content: string }
// Saves a new message and returns it (the sender adds it optimistically;
// the other participant picks it up on their next poll).
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req, { params }) {
  const { sessionId } = await params;
  const auth = await authorize(sessionId);
  if (auth.error) return auth.error;

  const { ps, session } = auth;

  if (ps.status !== 'active') {
    return NextResponse.json({ error: 'Session is not active.' }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const content = (body.content || '').trim();
  if (!content) {
    return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
  }

  const label =
    session.role === 'student'
      ? session.anonymous_id || 'Anonymous Student'
      : 'Peer Supporter';

  const saved = await PeerMessage.create({
    session_id:   sessionId,
    sender_role:  session.role,
    sender_label: label,
    content,
    timestamp:    new Date(),
  });

  return NextResponse.json({
    id:           saved._id.toString(),
    session_id:   saved.session_id,
    sender_role:  saved.sender_role,
    sender_label: saved.sender_label,
    content:      saved.content,
    timestamp:    saved.timestamp,
  });
}
