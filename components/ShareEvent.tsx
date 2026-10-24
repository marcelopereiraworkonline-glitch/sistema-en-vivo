'use client';
import { useEffect, useState } from 'react';

export default function ShareEvent({ code }: { code: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setUrl(`${window.location.origin}/participar/${encodeURIComponent(code)}`);
  }, [code]);
  const qrUrl = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(url)}`
    : '';
  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return <section className="card">
    <h2>Compartir con invitados</h2>
    {url ? <>
      <img src={qrUrl} alt="Código QR del enlace público del evento"
        width={320} height={320} style={{ maxWidth: '100%', background: 'white', padding: 12 }} />
      <p><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
      <div className="split">
        <button type="button" className="btn" onClick={copy}>{copied ? 'Enlace copiado' : 'Copiar enlace'}</button>
        <a className="btn secondary" href={url} target="_blank" rel="noopener noreferrer">Abrir página pública</a>
      </div>
    </> : <p className="muted">Preparando enlace...</p>}
  </section>;
}