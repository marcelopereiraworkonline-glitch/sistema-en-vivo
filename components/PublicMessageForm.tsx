'use client';
import { useState } from 'react';
import { browser } from '@/lib/supabase';

export default function PublicMessageForm({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = message.trim();
    if (!text || text.length > 200 || busy) return;
    setBusy(true); setFeedback('');
    const { error } = await browser().from('submissions').insert({ event_id: eventId, kind: 'message', message: text, status: 'pending' });
    setBusy(false);
    if (error) { setFeedback('No se pudo enviar. Intentá nuevamente.'); return; }
    setMessage('');
    setFeedback('¡Mensaje recibido! Quedó pendiente de aprobación.');
  }
  return <form className="card" onSubmit={send}>
    <h2>Enviá tu mensaje</h2>
    <label htmlFor="public-message">Tu mensaje (máximo 200 caracteres)</label>
    <textarea id="public-message" rows={4} maxLength={200} required value={message} onChange={e => setMessage(e.target.value)} placeholder="Escribí algo para compartir con el evento..." style={{ width: '100%', padding: 12 }} />
    <p className="muted">{message.length}/200</p>
    <button className="btn" type="submit" disabled={busy || !message.trim()}>{busy ? 'Enviando...' : 'Enviar mensaje'}</button>
    {feedback && <p role="status">{feedback}</p>}
  </form>;
}