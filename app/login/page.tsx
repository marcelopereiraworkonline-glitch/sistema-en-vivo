'use client';

import { useState, type FormEvent } from 'react';
import { browser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Internal Auth identifier: users sign in with a username, not an email address.
const USERNAME_ALIASES: Record<string, string> = {
  adminsys: 'adminsys@auth.sistema-en-vivo.invalid',
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const email = USERNAME_ALIASES[username.trim().toLowerCase()];
    if (!email) {
      setMessage('Usuario o contraseña incorrectos.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await browser().auth.signInWithPassword({ email, password });
      if (error) {
        setMessage('Usuario o contraseña incorrectos.');
      } else {
        router.replace('/dashboard');
        router.refresh();
      }
    } catch {
      setMessage('No se pudo conectar. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap" style={{ maxWidth: 480 }}>
      <h1>Ingresar a Sistema en Vivo</h1>
      <form className="card" onSubmit={login}>
        <label>
          Nombre de usuario
          <input className="field" type="text" autoComplete="username" required
            value={username} onChange={event => setUsername(event.target.value)}
            placeholder="Nombre de usuario" />
        </label>
        <label>
          Contraseña
          <input className="field" type="password" autoComplete="current-password" required
            value={password} onChange={event => setPassword(event.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p role="status">{message}</p>
      </form>
      <p className="muted">El acceso es exclusivo para usuarios autorizados.</p>
    </main>
  );
}
