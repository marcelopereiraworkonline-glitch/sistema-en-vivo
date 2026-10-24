import { NextResponse } from 'next/server';
import { currentUser, userClient } from '@/lib/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Evento inválido' }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || !/^[0-9a-f-]{36}$/i.test(body.submission_id || '') || !['approved','rejected'].includes(body.status))
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  const db = await userClient();
  const { data: event } = await db.from('events').select('id,organization_id').eq('id', id).maybeSingle();
  if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
  const { data: org } = await db.from('organizations').select('id').eq('id', event.organization_id).eq('created_by', user.id).maybeSingle();
  if (!org) return NextResponse.json({ error: 'No autorizado para moderar este evento' }, { status: 403 });
  const { data, error } = await db.from('submissions')
    .update({ status: body.status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', body.submission_id).eq('event_id', id).eq('status', 'pending').select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data?.length) return NextResponse.json({ error: 'Mensaje no encontrado o ya revisado' }, { status: 409 });
  return NextResponse.json({ ok: true });
}