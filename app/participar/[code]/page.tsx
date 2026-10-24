import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import PublicMessageForm from '@/components/PublicMessageForm';

export const dynamic = 'force-dynamic';
export default async function Participate({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data: event } = await db.from('events').select('id,name,status').eq('code', code).eq('status','live').maybeSingle();
  return <main className="wrap" style={{ maxWidth: 620 }}>
    <p className="tag">Sistema en Vivo</p>
    {event ? <>
      <h1>{event.name}</h1>
      <p className="muted">Participá en vivo. Los mensajes se muestran solo después de ser aprobados.</p>
      <PublicMessageForm eventId={event.id} />
    </> : <>
      <h1>El evento no está activo</h1>
      <p>El organizador todavía no habilitó la participación, o el enlace no corresponde a un evento disponible.</p>
    </>}
    <Link href="/">Sistema en Vivo</Link>
  </main>;
}