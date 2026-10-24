import Link from 'next/link';

export default async function Participate({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <main className="wrap" style={{ maxWidth: 620, textAlign: 'center' }}>
    <p className="tag">Sistema en Vivo</p>
    <h1>¡Bienvenido al evento!</h1>
    <p className="muted">Accediste correctamente desde el enlace o código QR.</p>
    <div className="card">
      <h2>Participación del público</h2>
      <p>Estamos preparando el envío de mensajes y fotografías para este evento.</p>
      <p className="muted">Código de acceso: {code}</p>
    </div>
    <Link href="/">Sistema en Vivo</Link>
  </main>;
}