import { connectDB, User, ChatSession, Alert } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardWrapper() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();

  // Stats
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalPeers    = await User.countDocuments({ role: 'peer' });
  const pendingPeers  = await User.countDocuments({ role: 'peer', status: 'pending' });

  const highRiskDocs = await ChatSession.distinct('user_id', { intensity: 'high' });
  const highRisk = highRiskDocs.length;

  // Alerts
  const pendingAlertsResult = await Alert.find({ status: 'pending' })
    .sort({ timestamp: -1 })
    .populate('user_id', 'anonymous_id')
    .lean();

  const formattedAlerts = pendingAlertsResult.map(alert => ({
    id: alert._id.toString(),
    sessionId: alert.session_id,
    userId: alert.user_id._id.toString(),
    timestamp: alert.timestamp,
    anonId: alert.user_id?.anonymous_id || 'Unknown',
  }));

  // Peer applicants — roll_number is admin-only, never passed to student/peer contexts
  const peerDocs = await User.find({ role: 'peer' })
    .select('username roll_number experience_level status created_at')
    .sort({ created_at: -1 })
    .lean();

  const peers = peerDocs.map(p => ({
    id: p._id.toString(),
    username: p.username,
    roll_number: p.roll_number || '—',
    experience_level: p.experience_level || '—',
    status: p.status,
    created_at: p.created_at,
  }));

  const stats = {
    totalStudents,
    totalPeers,
    pendingPeers,
    highRisk,
    pendingAlerts: formattedAlerts.length,
  };

  return <AdminClient initialAlerts={formattedAlerts} initialPeers={peers} stats={stats} />;
}
