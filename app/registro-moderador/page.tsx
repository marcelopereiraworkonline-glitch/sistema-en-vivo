'use client';
import { useState, type FormEvent } from 'react';
import { browser } from '@/lib/supabase';

export default function ModeratorSignup() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [userId,setUserId]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);setMessage('');
    try {
      const {data,error}=await browser().auth.signUp({email:email.trim(),password});
      if(error) throw error;
      if(data.user?.id) setUserId(data.user.id);
      setMessage('Cuenta solicitada. Revisá tu correo para confirmar el registro si se requiere. Enviá tu identificador al administrador del evento.');
    } catch(err) {setMessage(err instanceof Error ? err.message : 'No se pudo registrar');}
    finally {setBusy(false);}
  }
  return <main className="wrap" style={{maxWidth:540}}>
    <h1>Registro de moderadores</h1>
    <p>Creá una cuenta personal. El administrador debe autorizarte antes de que puedas moderar.</p>
    <form className="card" onSubmit={submit}>
      <label>Correo electrónico<input className="field" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
      <label>Contraseña (mínimo 12 caracteres)<input className="field" type="password" required minLength={12} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></label>
      <button className="btn" disabled={busy}>{busy?'Registrando...':'Crear cuenta'}</button>
    </form>
    {message && <p role="status">{message}</p>}
    {userId && <div className="card"><p>Tu identificador para el administrador:</p><code style={{overflowWrap:'anywhere'}}>{userId}</code><p><button className="btn secondary" onClick={()=>navigator.clipboard.writeText(userId)}>Copiar identificador</button></p></div>}
    <p><a href="/login">Ya tengo cuenta: ingresar</a></p>
  </main>;
}