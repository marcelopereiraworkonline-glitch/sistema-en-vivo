import { NextResponse } from 'next/server';
import { currentUser, userClient } from '@/lib/server';

async function handler(req: Request, params: Promise<{id:string}>, method:'POST'|'DELETE') {
  const user = await currentUser();
  if (!user) return NextResponse.json({error:'No autorizado'}, {status:401});
  const {id} = await params;
  const body = await req.json().catch(() => null);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(body?.user_id || ''))
    return NextResponse.json({error:'Datos inválidos'}, {status:400});
  const db = await userClient();
  const {data:event} = await db.from('events').select('id,organization_id').eq('id',id).maybeSingle();
  if (!event) return NextResponse.json({error:'Evento no encontrado'}, {status:404});
  const {data:org} = await db.from('organizations').select('id').eq('id',event.organization_id).eq('created_by',user.id).maybeSingle();
  if (!org) return NextResponse.json({error:'Solo el administrador puede asignar moderadores'}, {status:403});
  if (method === 'POST') {
    if (body.user_id === user.id) return NextResponse.json({error:'El administrador ya tiene permisos de moderación'}, {status:400});
    const {data:member} = await db.from('organization_members').select('user_id').eq('organization_id',event.organization_id).eq('user_id',body.user_id).maybeSingle();
    if (!member) return NextResponse.json({error:'Primero agregá el usuario a la organización'}, {status:400});
    const {data:existing} = await db.from('event_moderators').select('user_id').eq('event_id',id).eq('user_id',body.user_id).maybeSingle();
    if (existing) return NextResponse.json({ok:true});
    const {count} = await db.from('event_moderators').select('user_id',{count:'exact',head:true}).eq('event_id',id);
    if ((count ?? 0) >= 3) return NextResponse.json({error:'Máximo 3 moderadores por evento'}, {status:409});
    const {error} = await db.from('event_moderators').insert({event_id:id,organization_id:event.organization_id,user_id:body.user_id});
    return NextResponse.json(error?{error:error.message}:{ok:true},{status:error?400:200});
  }
  const {error} = await db.from('event_moderators').delete().eq('event_id',id).eq('user_id',body.user_id);
  return NextResponse.json(error?{error:error.message}:{ok:true},{status:error?400:200});
}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}) {return handler(req,params,'POST');}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}) {return handler(req,params,'DELETE');}
