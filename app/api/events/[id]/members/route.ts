import {NextResponse} from 'next/server';
import {currentUser,userClient} from '@/lib/server';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}) {
 const user=await currentUser();
 if(!user) return NextResponse.json({error:'No autorizado'},{status:401});
 const {id}=await params;
 const body=await req.json().catch(()=>null);
 if(!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(body?.user_id || '')) return NextResponse.json({error:'Identificador inválido'},{status:400});
 const db=await userClient();
 const {data:event}=await db.from('events').select('organization_id').eq('id',id).maybeSingle();
 if(!event) return NextResponse.json({error:'Evento no encontrado'},{status:404});
 const {data:org}=await db.from('organizations').select('id').eq('id',event.organization_id).eq('created_by',user.id).maybeSingle();
 if(!org) return NextResponse.json({error:'No autorizado'},{status:403});
 if(body.user_id===user.id) return NextResponse.json({error:'El administrador ya tiene acceso'},{status:400});
 const {data:member}=await db.from('organization_members').select('user_id').eq('organization_id',event.organization_id).eq('user_id',body.user_id).maybeSingle();
 if(member) return NextResponse.json({ok:true});
 const {error}=await db.from('organization_members').insert({organization_id:event.organization_id,user_id:body.user_id,role:'moderator'});
 return NextResponse.json(error?{error:'No se pudo agregar. Comprobá que el usuario esté registrado.'}:{ok:true},{status:error?400:200});
}