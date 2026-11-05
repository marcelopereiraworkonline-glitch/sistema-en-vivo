'use client';
import { useState } from 'react';
import { browser } from '@/lib/supabase';
type Kind = 'message' | 'image' | 'video';
async function videoDuration(file: File): Promise<number> {
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file); const video=document.createElement('video');
    video.preload='metadata'; video.onloadedmetadata=()=>{const d=video.duration;URL.revokeObjectURL(url);Number.isFinite(d)?resolve(d):reject(new Error('Duración no válida'));};
    video.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo leer el video'));};video.src=url;
  });
}
export default function PublicMessageForm({eventId}:{eventId:string}){
 const [kind,setKind]=useState<Kind>('message');const [message,setMessage]=useState('');const [file,setFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);const [orientation,setOrientation]=useState<'horizontal'|'vertical'|null>(null);const [feedback,setFeedback]=useState('');
 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setBusy(true);setFeedback('');
  try{
   const db=browser();
   if(kind==='message'){
    const text=message.trim();if(!text||text.length>200)throw new Error('Escribí un mensaje de hasta 200 caracteres.');
    const {error}=await db.from('submissions').insert({event_id:eventId,kind:'message',message:text,status:'pending'});if(error)throw error;setMessage('');
   }else{
    if(!file)throw new Error('Seleccioná un archivo.');
    const allowed=kind==='image'?['image/jpeg','image/png','image/webp']:['video/mp4','video/webm'];
    if(!allowed.includes(file.type))throw new Error('Formato de archivo no admitido.');
    if(file.size>(kind==='image'?10:25)*1024*1024)throw new Error('Archivo demasiado grande.');
    if(kind==='video' && await videoDuration(file)>10)throw new Error('El video debe durar como máximo 10 segundos.');
    const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'} as Record<string,string>)[file.type];
    const path=`${eventId}/${crypto.randomUUID()}.${ext}`;
    const {error:uploadError}=await db.storage.from('event-media').upload(path,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;
    const {error:insertError}=await db.from('submissions').insert({event_id:eventId,kind,media_path:path,status:'pending'});
    if(insertError){await db.storage.from('event-media').remove([path]);throw insertError;}setFile(null);setOrientation(null);
    const input=document.getElementById('public-media') as HTMLInputElement|null;if(input)input.value='';
   }
   setFeedback('¡Recibido! Tu contenido quedó pendiente de aprobación.');
  }catch(e){setFeedback(e instanceof Error?e.message:'No se pudo enviar. Intentá nuevamente.');}
  finally{setBusy(false);}
 }
 return <form className="card" onSubmit={send}>
  <h2>Participá en el evento</h2>
  <div className="split">{(['message','image','video'] as Kind[]).map(k=><button key={k} type="button" className={kind===k?'btn':'btn secondary'} disabled={busy} onClick={()=>{setKind(k);setFile(null);setOrientation(null);setFeedback('');}}>{k==='message'?'Mensaje':k==='image'?'Foto':'Video'}</button>)}</div>
  {kind==='message'?<><label htmlFor="public-message">Tu mensaje (máximo 200 caracteres)</label><textarea id="public-message" rows={4} maxLength={200} required value={message} onChange={e=>setMessage(e.target.value)} style={{width:'100%',padding:12}}/><p className="muted">{message.length}/200</p></>:<><label htmlFor="public-media">{kind==='image'?'Elegí una foto (máximo 10 MB)':'Elegí un video (máximo 10 segundos, 25 MB)'}</label>{kind==='video'&&<p className="muted" style={{padding:'12px 14px',border:'1px solid #64748b',borderRadius:10}}>📱 <strong>Recomendación:</strong> grabá el video con el celular en posición horizontal (acostado), preferentemente en formato 16:9. Así se verá mejor en la pantalla gigante. Duración máxima: 10 segundos.</p>}<input id="public-media" type="file" required accept={kind==='image'?'image/jpeg,image/png,image/webp':'video/mp4,video/webm'} onChange={async e=>{const chosen=e.target.files?.[0]||null;setFile(chosen);setOrientation(null);if(kind==='video'&&chosen){const url=URL.createObjectURL(chosen);const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{setOrientation(v.videoWidth>=v.videoHeight?'horizontal':'vertical');URL.revokeObjectURL(url);};v.onerror=()=>URL.revokeObjectURL(url);v.src=url;}}}/></>}
  <button className="btn" type="submit" disabled={busy||(kind==='message'?!message.trim():!file)}>{busy?'Enviando...':'Enviar para aprobación'}</button>
  {feedback&&<p role="status">{feedback}</p>}
 </form>;
}