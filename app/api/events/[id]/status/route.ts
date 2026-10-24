import { NextResponse } from 'next/server';
import { currentUser, userClient } from '@/lib/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Evento inválido' }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (body?.status !== 'live' && body?.status !== 'draft') return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  const db = await userClient();
  const { data: event } = await db.from('events').select('id,organization_id').eq('id', id).maybeSingle();
  if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
  const { data: org } = await db.from('organizations').select('id').eq('id', event.organization_id).eq('created_by', user.id).maybeSingle();
  if (!org) return NextResponse.json({ error: 'Solo el propietario puede cambiar el estado' }, { status: 403 });
  const { error } = await db.from('events').update({ status: body.status }).eq('id', id);
  return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 400 : 200 });
}