import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import LayoutClient from '@/components/LayoutClient';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  return (
    <LayoutClient
      user={session.user?.name || session.user?.email || ''}
    />
  );
}
