import Link from 'next/link';
import {redirect} from 'next/navigation';
import {currentUser,userClient} from '@/lib/server';
export const dynamic='force-dynamic';
export default async function MyEvents(){
 const user=await currentUser();
 if(!user) redirect('/login');
 const db=await userClient();
 const {data:assigned,error}=await db.from('event_moderators').select('event_id').eq('user_id',user.id);
 return <main className="wrap" style={{maxWidth:720}}>
  <h1>Mis eventos para moderar</h1>
  <p className="muted">Accedé a los eventos que te asignó el administrador.</p>
  {error && <p role="alert">No se pudieron cargar tus asignaciones.</p>}
  {!error && !assigned?.length && <p className="card">Tu cuenta está registrada, pero todavía no tenés eventos asignados. Solicitá al administrador que te asigne a un evento.</p>}
  {(assigned||[]).map(a=><div className="card" key={a.event_id}><p>Evento asignado</p><Link className="btn" href={`/moderar/${a.event_id}`}>Abrir panel de moderación</Link></div>)}
  <p><Link href="/">Inicio</Link></p>
 </main>;
}