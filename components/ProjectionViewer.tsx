'use client';
import {useEffect,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
type Submission={id:string;kind:'message'|'image'|'video';message:string|null;media_path:string|null;created_at:string};
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
function Display({item}:{item:Submission}){
 const [url,setUrl]=useState('');const [error,setError]=useState('');
 useEffect(()=>{let alive=true;let objectUrl='';setUrl('');setError('');if(!item.media_path)return;
 db.storage.from('event-media').download(item.media_path).then(({data,error})=>{if(!alive)return;if(error||!data){setError('No se pudo cargar el contenido');return;}objectUrl=URL.createObjectURL(data);setUrl(objectUrl);});
 return()=>{alive=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};},[item.id,item.media_path]);
 if(item.kind==='message')return <div style={{fontSize:'clamp(36px,5.2vw,92px)',fontWeight:750,lineHeight:1.2,overflowWrap:'anywhere',whiteSpace:'pre-wrap'}}>{item.message}</div>;
 if(error)return <p>{error}</p>;if(!url)return <p>Cargando contenido…</p>;
 return item.kind==='image'?<img src={url} alt="Fotografía del público" style={{maxWidth:'100%',maxHeight:'70vh',objectFit:'contain'}}/>:<video src={url} autoPlay playsInline onLoadedData={e=>{void e.currentTarget.play().catch(()=>{});}} style={{maxWidth:'100%',maxHeight:'70vh',objectFit:'contain'}}/>;
}
export default function ProjectionViewer({eventId,name}:{eventId:string;name:string}){
 const [items,setItems]=useState<Submission[]>([]);const [index,setIndex]=useState(0);const [active,setActive]=useState(true);const [error,setError]=useState('');const [started,setStarted]=useState(false);
 useEffect(()=>{let mounted=true;async function refresh(){
 const {data:event}=await db.from('events').select('status').eq('id',eventId).eq('status','live').maybeSingle();
 if(!mounted)return;setActive(!!event);if(!event){setItems([]);return;}
 const {data,error:fetchError}=await db.from('submissions').select('id,kind,message,media_path,created_at').eq('event_id',eventId).eq('status','approved').order('created_at',{ascending:false}).limit(60);
 if(!mounted)return;if(fetchError){setError('No se pudo cargar el contenido.');return;}setError('');setItems((data||[]).reverse() as Submission[]);
 }void refresh();const timer=window.setInterval(()=>void refresh(),4000);return()=>{mounted=false;window.clearInterval(timer);};},[eventId]);
 const current=items.length?items[index%items.length]:null;
 useEffect(()=>{if(!started||!active||!current)return;const timer=window.setTimeout(()=>setIndex(i=>i+1),10000);return()=>window.clearTimeout(timer);},[started,active,current?.id,index]);
 return <main style={{minHeight:'100vh',background:'#090e1b',color:'#fff',padding:'clamp(20px,5vw,80px)',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:'system-ui,sans-serif'}}>
 <header style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center'}}><div style={{fontSize:'clamp(22px,3vw,44px)',fontWeight:800}}>{name}</div><div style={{border:'1px solid #64748b',borderRadius:40,padding:'10px 18px',fontSize:'clamp(14px,1.6vw,22px)'}}>● {active?'EN VIVO':'EN PAUSA'}</div></header>
 {!started&&<div style={{position:'fixed',inset:0,zIndex:10,background:'#090e1b',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,textAlign:'center',padding:24}}><h1>Proyección lista</h1><p>Activá la pantalla para reproducir los videos con sonido.</p><button type="button" className="btn" style={{fontSize:24,padding:'18px 32px'}} onClick={()=>setStarted(true)}>Iniciar proyección con audio</button></div>}
 <section aria-live="polite" style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',maxWidth:1500,margin:'auto',width:'100%'}}>
 {error?<p>{error}</p>:!active?<p style={{fontSize:'clamp(30px,5vw,70px)'}}>La participación está pausada</p>:current?<><div style={{fontSize:'clamp(18px,2vw,28px)',letterSpacing:3,color:'#a5b4fc',marginBottom:30}}>{current.kind==='message'?'MENSAJES DEL PÚBLICO':current.kind==='image'?'FOTOS DEL PÚBLICO':'VIDEOS DEL PÚBLICO'}</div><Display key={current.id} item={current}/></>:<><div style={{fontSize:'clamp(34px,5vw,75px)',fontWeight:800}}>¡Bienvenidos!</div><p style={{fontSize:'clamp(20px,2.8vw,38px)',color:'#cbd5e1'}}>Esperando contenido aprobado…</p></>}</section>
 <footer style={{display:'flex',justifyContent:'space-between',gap:16,flexWrap:'wrap',fontSize:'clamp(14px,1.6vw,24px)',color:'#cbd5e1'}}><span>Sistema en Vivo</span><span>{active&&items.length?`${index%items.length+1} / ${items.length} contenidos`:'Participá desde el QR del evento'}</span></footer>
 </main>;
}