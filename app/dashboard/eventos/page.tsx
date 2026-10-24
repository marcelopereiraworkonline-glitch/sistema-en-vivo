import Link from 'next/link';
import { currentUser, userClient } from '@/lib/server';
import { redirect } from 'next/navigation';

export default async function Events() {
  const user = await currentUser();
  if (!user) redirect('/login');
  const db = await userClient();
  const { data: memberships } = await db.from('organization_members')
    .select('organization_id').eq('user_id', user.id);
  const ids = (memberships || []).map(item => item.organization_id);
  const { data: events } = ids.length
    ? await db.from('events').select('id,name,code,status,created_at')
        .in('organization_id', ids).order('created_at', { ascending: false })
    : { data: [] };
  return <main className="wrap">
    <div className="split">
      <h1>Eventos</h1>
      <Link className="btn" href="/dashboard/eventos/nuevo">+ Nuevo evento</Link>
    </div>
    <div className="grid">
      {events?.map(event => <div className="card" key={event.id}>
        <h2>{event.name}</h2>
        <p className="muted">Código: {event.code} · {event.status}</p>
        <Link className="btn" href={`/dashboard/eventos/${event.id}/qr`}>Ver enlace y QR</Link>
      </div>)}
    </div>
  </main>;
}