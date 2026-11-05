'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {browser} from '@/lib/supabase';
type Item={id:string;kind:'message'|'image'|'video';message:string|null;media_path:string|null;status:string;created_at:string};
function Preview({item}:{item:Item}){
 const [url,setUrl]=useState('');const [error,setError]=useState('');
 useEffect(()=>{let alive=true;let objectUrl='';if(!item.media_path)return;
 browser().storage.from('event-media').download(item.media_path).then(({data,error})=>{
 if(!alive)return;if(error||!data){setError('No se pudo cargar el archivo');return;}objectUrl=URL.createObjectURL(data);setUrl(objectUrl);
 });return()=>{alive=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};},[item.media_path]);
 if(item.kind==='message')return <p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{item.message}</p>;
 if(error)return <p role="alert">{error}</p>;
 if(!url)return <p className="muted">Cargando archivo…</p>;
 return item.kind==='image'?<img src={url} alt="Imagen enviada por el público" style={{maxWidth:'100%',maxHeight:350,objectFit:'contain'}}/>:<video src={url} controls preload="metadata" style={{maxWidth:'100%',maxHeight:350}}/>;
}
export default function ModerationPanel({eventId,initial}:{eventId:string;initial:Item[]}){
 const [items,setItems]=useState(initial);const [busy,setBusy]=useState<string|null>(null);const [error,setError]=useState('');const router=useRouter();
 async function review(id:string,status:'approved'|'rejected'){
 setBusy(id);setError('');try{const res=await fetch(`/api/events/${eventId}/moderate`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({submission_id:id,status})});const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo moderar');setItems(old=>old.filter(item=>item.id!==id));router.refresh();}catch(e){setError(e instanceof Error?e.message:'Error desconocido');}finally{setBusy(null);}
 }
 return <section className="card"><h2>Contenido pendiente ({items.length})</h2><button className="btn secondary" type="button" onClick={()=>window.location.reload()}>Actualizar contenido</button>{error&&<p role="alert">{error}</p>}{!items.length&&<p className="muted">No hay contenido pendiente.</p>}
 {items.map(item=><div className="card" key={item.id} style={{marginTop:12}}><p className="muted">{item.kind==='message'?'Mensaje':item.kind==='image'?'Fotografía':'Video'}</p><Preview item={item}/><p className="muted">{new Date(item.created_at).toLocaleString('es-UY')}</p><div className="split"><button className="btn" disabled={busy!==null} onClick={()=>review(item.id,'approved')}>Aprobar</button><button className="btn secondary" disabled={busy!==null} onClick={()=>review(item.id,'rejected')}>Rechazar</button></div></div>)}</section>;
}