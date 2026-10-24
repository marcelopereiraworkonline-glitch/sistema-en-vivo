import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser, userClient } from '@/lib/server';
import ModerationPanel from '@/components/ModerationPanel';

export const dynamic = 'force-dynamic';
export default async function ModeratorPage({params}:{params:Promise<{id:string}>}) {
  const {id} = await params;
  const user = await currentUser();
  if (!user) redirect('/login');
  const db = await userClient();
  const {data:assigned} = await db.from('event_moderators').select('user_id').eq('event_id',id).eq('user_id',user.id).maybeSingle();
  if (!assigned) notFound();
  const {data:pending,error} = await db.from('submissions').select('id,message,status,created_at').eq('event_id',id).eq('status','pending').order('created_at',{ascending:true}).limit(100);
  return <main className="wrap" style={{maxWidth:750}}>
    <Link href="/">← Inicio</Link>
    <h1>Panel del moderador</h1>
    <p className="muted">Revisá los mensajes antes de que aparezcan en la pantalla del evento.</p>
    {error ? <p role="alert">No se pudieron cargar los mensajes.</p> : <ModerationPanel eventId={id} initial={pending || []}/>}
  </main>;
}