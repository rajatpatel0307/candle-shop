import { useCallback,useEffect,useId,useRef,useState } from 'react';
import { ImagePlus,Link2,LoaderCircle,Upload,X } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';

export function useImageUploadState(){
 const [uploads,setUploads]=useState({});
 const onImageBusy=useCallback((key,busy)=>setUploads(current=>current[key]===busy?current:{...current,[key]:busy}),[]);
 return {imageBusy:Object.values(uploads).some(Boolean),onImageBusy};
}
export function ImageInput({label='Image',value='',onChange,onBusyChange,disabled=false,className=''}){
 const id=useId(),[mode,setMode]=useState('url'),[draft,setDraft]=useState(value||''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const notify=useRef(onBusyChange),mounted=useRef(true),fileInput=useRef(null);
 notify.current=onBusyChange;
 const dirty=mode==='url'&&draft.trim()!==(value||'');
 useEffect(()=>{notify.current?.(busy||dirty);},[busy,dirty]);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;notify.current?.(false);};},[]);
 useEffect(()=>{setDraft(value||'');},[value]);
 const upload=async file=>{
  if(busy)return;
  if(file&&(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>5*1024*1024)){setError('Choose a JPG, PNG, WebP or GIF image smaller than 5 MB.');if(fileInput.current)fileInput.current.value='';return;}
  if(!file&&!/^https?:\/\//i.test(draft.trim())){setError('Enter a full http or https image URL.');return;}
  setError('');setBusy(true);
  try{const response=await apiClient.post('/admin/media/images',file||{url:draft.trim()},file?{headers:{'Content-Type':file.type}}:{});if(mounted.current){onChange(response.data.data.image.url);setDraft(response.data.data.image.url);}}
  catch(err){if(mounted.current)setError(err.response?.data?.error?.message||'Upload failed. Please try again.');}
  finally{if(mounted.current){setBusy(false);if(fileInput.current)fileInput.current.value='';}}
 };
 return <div className={`rounded border border-stone-200 bg-[#fffdf8] p-4 ${className}`}><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><label htmlFor={id} className="text-xs font-medium text-stone-700">{label}</label><div className="flex gap-1" role="group" aria-label={`${label} source`}>{[['url','Image URL',Link2],['local','From device',Upload]].map(([key,text,Icon])=><button key={key} type="button" disabled={disabled||busy} aria-pressed={mode===key} className={`inline-flex items-center gap-1.5 rounded border px-3 py-2 text-[11px] ${mode===key?'border-[#8a775f] bg-[#f2ecdf]':'border-stone-200'}`} onClick={()=>{setMode(key);setDraft(value||'');setError('');}}><Icon size={13}/>{text}</button>)}</div></div>
 {mode==='url'?<div className="flex flex-wrap gap-2"><input id={id} className="input min-w-0 flex-1" type="url" placeholder="https://example.com/image.jpg" value={draft} disabled={disabled||busy} onChange={event=>{setDraft(event.target.value);setError('');}}/><button type="button" className="btn-secondary" disabled={disabled||busy||!draft.trim()||!dirty} onClick={()=>upload()}>Upload URL</button>{dirty&&<button type="button" className="text-xs text-stone-500 underline" disabled={busy} onClick={()=>{setDraft(value||'');setError('');}}>Cancel</button>}</div>:<div><input ref={fileInput} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled||busy} className="block w-full text-xs text-stone-500 file:mr-3 file:rounded file:border file:border-stone-200 file:bg-[#f2ecdf] file:px-3 file:py-2 file:text-xs" onChange={event=>{const file=event.target.files?.[0];if(file)upload(file);}}/><p className="mt-2 text-[10px] text-stone-500">JPG, PNG, WebP or GIF. Up to 5 MB.</p></div>}
 {busy&&<p role="status" className="mt-3 flex items-center gap-2 text-xs text-stone-500"><LoaderCircle className="h-4 w-4 animate-spin"/>Uploading image...</p>}{dirty&&!busy&&<p className="mt-2 text-[10px] text-stone-500">Upload this URL before saving your changes.</p>}{error&&<p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
 {value&&<div className="mt-3 flex items-center gap-3"><img src={value} alt={`${label} preview`} className="h-20 w-24 rounded border border-stone-200 object-contain"/><div><p className="flex items-center gap-1 text-[10px] text-stone-500"><ImagePlus size={12}/>Image selected</p><button type="button" className="mt-2 inline-flex items-center gap-1 text-[11px] text-red-700" disabled={disabled||busy} onClick={()=>{onChange('');setDraft('');setError('');}}><X size={12}/>Remove image</button></div></div>}
 </div>;
}
