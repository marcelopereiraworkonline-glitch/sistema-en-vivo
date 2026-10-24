import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser, userClient } from '@/lib/server';
import ShareEvent from '@/components/ShareEvent';

export default async function EventQR({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect('/login');
  const db = await userClient();
  const { data: event } = await db.from('events')
    .select('id,name,code,status,organization_id')
    .eq('id', id).single();
  if (!event) notFound();
  const { data: membership } = await db.from('organization_members')
    .select('role').eq('organization_id', event.organization_id)
    .eq('user_id', user.id).maybeSingle();
  if (!membership) notFound();
  return <main className="wrap" style={{ maxWidth: 750 }}>
    <Link href="/dashboard/eventos">← Volver a eventos</Link>
    <h1>{event.name}</h1>
    <p className="muted">Código: {event.code}</p>
    <ShareEvent code={event.code} />
    <p className="muted">El QR abre la página pública del evento. El envío de mensajes estará disponible en la siguiente etapa.</p>
  </main>;
}