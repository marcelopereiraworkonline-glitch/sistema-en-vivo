import { createClient } from '@supabase/supabase-js';
import ProjectionViewer from '@/components/ProjectionViewer';

export const dynamic = 'force-dynamic';
export default async function Projection({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data: event } = await db.from('events').select('id,name').eq('code', code).eq('status','live').maybeSingle();
  if (!event) return <main style={{background:'#090e1b',color:'white',minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'system-ui'}}><h1>El evento no está activo</h1></main>;
  return <ProjectionViewer eventId={event.id} name={event.name} />;
}