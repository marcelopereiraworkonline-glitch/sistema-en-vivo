import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser, userClient } from '@/lib/server';
import ShareEvent from '@/components/ShareEvent';
import EventControls from '@/components/EventControls';
import ModerationPanel from '@/components/ModerationPanel';

export const dynamic = 'force-dynamic';
export default async function EventQR({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect('/login');
  const db = await userClient();
  const { data: event } = await db.from('events')
    .select('id,name,code,status,organization_id').eq('id', id).maybeSingle();
  if (!event) notFound();
  const { data: org } = await db.from('organizations').select('id')
    .eq('id', event.organization_id).eq('created_by', user.id).maybeSingle();
  if (!org) notFound();
  const { data: pending } = await db.from('submissions')
    .select('id,message,status,created_at').eq('event_id', id)
    .eq('status', 'pending').order('created_at', { ascending: true }).limit(100);
  return <main className="wrap" style={{ maxWidth: 750 }}>
    <Link href="/dashboard/eventos">← Volver a eventos</Link>
    <h1>{event.name}</h1>
    <p className="muted">Código: {event.code}</p>
    <EventControls id={event.id} status={event.status} />
    <ShareEvent code={event.code} />
    <ModerationPanel eventId={event.id} initial={pending || []} />
    <p className="muted">Actualizá los mensajes para ver nuevas participaciones.</p>
  </main>;
}