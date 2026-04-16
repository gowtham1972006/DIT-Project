'use server';

import { connectDB, User, Alert } from '@/lib/db';
import { getSession } from '@/lib/auth';

// ── Guard helper ────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' };
  }
  return { session };
}

// ── Existing actions ─────────────────────────────────────────────────────────

export async function unmaskUser(userId) {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  try {
    await connectDB();
    const user = await User.findById(userId).select('username');
    if (user) return { success: true, username: user.username };
    return { error: 'User not found' };
  } catch {
    return { error: 'Failed to unmask user' };
  }
}

export async function resolveAlert(alertId) {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  try {
    await connectDB();
    await Alert.findByIdAndUpdate(alertId, { status: 'resolved' });
    return { success: true };
  } catch {
    return { error: 'Failed to resolve alert' };
  }
}

// ── Peer Supporter management ────────────────────────────────────────────────

/**
 * Fetch all peer-role users for the admin panel.
 * roll_number is included here — admin-only, never sent to client-side student/peer contexts.
 */
export async function getPeerApplicants() {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  try {
    await connectDB();
    const peers = await User.find({ role: 'peer' })
      .select('username roll_number experience_level status created_at')
      .sort({ created_at: -1 })
      .lean();

    return {
      success: true,
      peers: peers.map(p => ({
        id: p._id.toString(),
        username: p.username,
        roll_number: p.roll_number || '—',
        experience_level: p.experience_level || '—',
        status: p.status,
        created_at: p.created_at,
      })),
    };
  } catch {
    return { error: 'Failed to fetch peer applicants.' };
  }
}

/**
 * Approve a peer supporter — sets status to "approved".
 */
export async function approvePeer(userId) {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'approved' },
      { new: true }
    );
    if (!user) return { error: 'User not found.' };
    return { success: true };
  } catch {
    return { error: 'Failed to approve peer supporter.' };
  }
}

/**
 * Reject a peer supporter — sets status to "rejected".
 * Record is KEPT in the database for audit purposes.
 */
export async function rejectPeer(userId) {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'rejected' },
      { new: true }
    );
    if (!user) return { error: 'User not found.' };
    return { success: true };
  } catch {
    return { error: 'Failed to reject peer supporter.' };
  }
}
