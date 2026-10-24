'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Member = { user_id: string; role: string };
export default function ModeratorManager({ eventId, members, assigned }: { eventId: string; members: Member[]; assigned: string[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function act(userId: string, method: 'POST' | 'DELETE') {
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/events/${eventId}/moderators`, { method, headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ user_id:userId }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'No se pudo guardar');
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error inesperado'); }
    finally { setBusy(false); }
  }
  return <section className="card">
    <h2>Moderadores ({assigned.length}/3)</h2>
    <p className="muted">Podés asignar hasta tres usuarios que ya pertenezcan a la organización. Cada uno utiliza su propia cuenta.</p>
    {assigned.map(id => <div className="split" key={id} style={{ marginBottom: 12 }}>
      <span style={{ overflowWrap:'anywhere' }}>{id}</span>
      <button type="button" className="btn secondary" disabled={busy} onClick={() => act(id,'DELETE')}>Quitar</button>
    </div>)}
    {assigned.length < 3 && <div className="split">
      <select aria-label="Elegir integrante" value={selected} onChange={e => setSelected(e.target.value)} style={{ maxWidth:'100%', padding:12 }}>
        <option value="">Seleccionar integrante</option>
        {members.filter(m => !assigned.includes(m.user_id) && m.role !== 'owner').map(m => <option key={m.user_id} value={m.user_id}>{m.user_id} ({m.role})</option>)}
      </select>
      <button type="button" className="btn" disabled={!selected || busy} onClick={() => act(selected,'POST')}>Asignar moderador</button>
    </div>}
    {error && <p role="alert">{error}</p>}
  </section>;
}