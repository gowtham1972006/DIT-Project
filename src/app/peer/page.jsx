import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PeerClient from './PeerClient';

export default async function PeerDashboard() {
  const session = await getSession();

  // Must be logged in as a peer
  if (!session || session.role !== 'peer') {
    redirect('/login');
  }

  // Peer must be approved — redirect unapproved to waiting screen
  if (session.status !== 'approved') {
    redirect('/register/pending');
  }

  // Render the client component for polling/interactions
  return <PeerClient initialUsername={session.username} />;
}
