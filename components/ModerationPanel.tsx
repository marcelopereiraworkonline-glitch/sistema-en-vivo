'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Item = { id: string; message: string | null; status: string; created_at: string };
export default function ModerationPanel({ eventId, initial }: { eventId: string; initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  async function review(id: string, status: 'approved' | 'rejected') {
    setBusy(id); setError('');
    try {
      const res = await fetch(`/api/events/${eventId}/moderate`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submission_id: id, status }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo moderar');
      setItems(old => old.filter(item => item.id !== id));
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error desconocido'); }
    finally { setBusy(null); }
  }
  return <section className="card">
    <h2>Mensajes pendientes ({items.length})</h2>
    <button className="btn secondary" type="button" onClick={() => window.location.reload()}>Actualizar mensajes</button>
    {error && <p role="alert">{error}</p>}
    {!items.length && <p className="muted">No hay mensajes pendientes.</p>}
    {items.map(item => <div className="card" key={item.id} style={{ marginTop: 12 }}>
      <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.message}</p>
      <p className="muted">{new Date(item.created_at).toLocaleString('es-UY')}</p>
      <div className="split">
        <button className="btn" disabled={busy !== null} onClick={() => review(item.id, 'approved')}>Aprobar</button>
        <button className="btn secondary" disabled={busy !== null} onClick={() => review(item.id, 'rejected')}>Rechazar</button>
      </div>
    </div>)}
  </section>;
}