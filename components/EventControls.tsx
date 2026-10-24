'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EventControls({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function change() {
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/events/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status === 'live' ? 'draft' : 'live' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el evento');
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error desconocido'); }
    finally { setBusy(false); }
  }
  return <div className="card">
    <h2>Estado del evento</h2>
    <p>{status === 'live' ? 'Activo: los invitados pueden enviar mensajes.' : 'Inactivo: los invitados todavía no pueden enviar mensajes.'}</p>
    <button type="button" className="btn" disabled={busy} onClick={change}>{busy ? 'Guardando...' : status === 'live' ? 'Pausar participación' : 'Activar participación'}</button>
    {error && <p role="alert">{error}</p>}
  </div>;
}