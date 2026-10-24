'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Message = { id: string; message: string | null; created_at: string };
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

export default function ProjectionViewer({ eventId, name }: { eventId: string; name: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    async function refresh() {
      const { data: event } = await db.from('events').select('status').eq('id', eventId).eq('status', 'live').maybeSingle();
      if (!mounted) return;
      setActive(!!event);
      if (!event) { setMessages([]); return; }
      const { data, error: fetchError } = await db.from('submissions').select('id,message,created_at')
        .eq('event_id', eventId).eq('status','approved').eq('kind','message')
        .order('created_at', { ascending: false }).limit(60);
      if (!mounted) return;
      if (fetchError) { setError('No se pudieron cargar los mensajes.'); return; }
      setError('');
      setMessages((data || []).reverse());
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, [eventId]);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex(i => i + 1), 9000);
    return () => window.clearInterval(timer);
  }, []);
  const current = messages.length ? messages[index % messages.length] : null;
  return <main style={{ minHeight:'100vh', background:'#090e1b', color:'#fff', padding:'clamp(20px,5vw,80px)', display:'flex', flexDirection:'column', justifyContent:'space-between', fontFamily:'system-ui,sans-serif' }}>
    <header style={{ display:'flex', justifyContent:'space-between', gap:20, alignItems:'center' }}>
      <div style={{ fontSize:'clamp(22px,3vw,44px)', fontWeight:800 }}>{name}</div>
      <div style={{ border:'1px solid #64748b', borderRadius:40, padding:'10px 18px', fontSize:'clamp(14px,1.6vw,22px)' }}>● {active ? 'EN VIVO' : 'EN PAUSA'}</div>
    </header>
    <section aria-live="polite" style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', textAlign:'center', maxWidth:1500, margin:'auto', width:'100%' }}>
      {error ? <p>{error}</p> : !active ? <p style={{fontSize:'clamp(30px,5vw,70px)'}}>La participación está pausada</p>
        : current ? <>
          <div style={{fontSize:'clamp(18px,2vw,28px)', letterSpacing:3, color:'#a5b4fc', marginBottom:40}}>MENSAJES DEL PÚBLICO</div>
          <div key={current.id} style={{fontSize:'clamp(36px,5.2vw,92px)', fontWeight:750, lineHeight:1.2, overflowWrap:'anywhere', whiteSpace:'pre-wrap'}}>{current.message}</div>
        </> : <><div style={{fontSize:'clamp(34px,5vw,75px)', fontWeight:800}}>¡Bienvenidos!</div><p style={{fontSize:'clamp(20px,2.8vw,38px)', color:'#cbd5e1'}}>Esperando mensajes aprobados…</p></>}
    </section>
    <footer style={{display:'flex',justifyContent:'space-between',gap:16,flexWrap:'wrap',fontSize:'clamp(14px,1.6vw,24px)',color:'#cbd5e1'}}>
      <span>Sistema en Vivo</span><span>{active && messages.length ? `${index % messages.length + 1} / ${messages.length} mensajes` : 'Participá desde el QR del evento'}</span>
    </footer>
  </main>;
}