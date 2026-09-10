'use client';

import { useEffect, useMemo, useState } from 'react';
import { GripVertical, Minus, Plus, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

type LayoutItem = { column: 'main' | 'side'; order: number };
type LayoutMap = Record<string, LayoutItem>;
type ContactAlign = 'left' | 'center' | 'right';
type HeaderPart = 'identity' | 'avatar';
type FloatingPoint = { x: number; y: number };

const KEY = 'ai-cv-builder-layout-v3';
const FLOAT_KEY = 'ai-cv-builder-floating-position-v1';
const headingToKey: Record<string, string> = { PROFILE:'profile', EXPERIENCE:'experience', PROJECTS:'projects', SKILLS:'skills', EDUCATION:'education', CERTIFICATIONS:'certifications', LANGUAGES:'languages', INTERESTS:'interests' };
function cvId(){return new URLSearchParams(window.location.search).get('cv')||'cv-1'}
function storageKey(){return `${KEY}-${cvId()}`}
function readLayout():LayoutMap{try{return JSON.parse(localStorage.getItem(storageKey())||'{}')}catch{return {}}}
function writeLayout(v:LayoutMap){localStorage.setItem(storageKey(),JSON.stringify(v))}
function keyOf(el:Element){return headingToKey[el.querySelector('h3')?.textContent?.trim().toUpperCase()||'']||''}
function snapshot():LayoutMap{const r:LayoutMap={};document.querySelectorAll<HTMLElement>('.resume-main,.resume-side').forEach(p=>{const column=p.classList.contains('resume-side')?'side':'main';Array.from(p.children).forEach((el,index)=>{const k=keyOf(el);if(k)r[k]={column,order:index}})});return r}
function applyLayout(layout:LayoutMap){
  const paper=document.querySelector<HTMLElement>('.paper');const main=paper?.querySelector<HTMLElement>('.resume-main');const side=paper?.querySelector<HTMLElement>('.resume-side');if(!main||!side)return;
  const nodes=new Map<string,HTMLElement>();paper.querySelectorAll<HTMLElement>('.resume-section').forEach(el=>{const k=keyOf(el);if(k)nodes.set(k,el)});
  const compact=window.innerWidth<=850;
  const twoColumn=paper.classList.contains('cols-2')&&!compact;
  if(!twoColumn){
    const ordered=Array.from(nodes.entries()).sort(([a],[b])=>(layout[a]?.order??999)-(layout[b]?.order??999));
    ordered.forEach(([,el])=>main.appendChild(el));
    return;
  }
  Object.entries(layout).forEach(([k,item])=>{const el=nodes.get(k);const parent=item.column==='side'?side:main;if(el&&el.parentElement!==parent)parent.appendChild(el)});
  [main,side].forEach(parent=>Array.from(parent.children).sort((a,b)=>(layout[keyOf(a)]?.order??999)-(layout[keyOf(b)]?.order??999)).forEach(el=>parent.appendChild(el)));
}
function readHeaderOrder():HeaderPart[]{try{const v=JSON.parse(localStorage.getItem(`${KEY}-header-${cvId()}`)||'null');if(Array.isArray(v)&&v.every(x=>x==='identity'||x==='avatar'))return v}catch{}return ['identity','avatar']}
function writeHeaderOrder(v:HeaderPart[]){localStorage.setItem(`${KEY}-header-${cvId()}`,JSON.stringify(v))}
function applyHeaderOrder(order:HeaderPart[]){const head=document.querySelector<HTMLElement>('.resume-head');if(!head)return;const identity=head.querySelector<HTMLElement>('.resume-identity');const avatar=head.querySelector<HTMLElement>('.avatar');if(!identity||!avatar)return;order.forEach(k=>head.appendChild(k==='identity'?identity:avatar))}
function readFloatingPoint():FloatingPoint{try{const value=JSON.parse(localStorage.getItem(FLOAT_KEY)||'null');if(Number.isFinite(value?.x)&&Number.isFinite(value?.y))return value}catch{}return {x:window.innerWidth-74,y:window.innerHeight-142}}
function clampPoint(point:FloatingPoint){const size=54;return{x:Math.max(10,Math.min(window.innerWidth-size-10,point.x)),y:Math.max(10,Math.min(window.innerHeight-size-10,point.y))}}

export default function CVInteractions(){
 const[zoom,setZoom]=useState(100),[contact,setContact]=useState<ContactAlign>('left'),[headerAlign,setHeaderAlign]=useState<ContactAlign>('left'),[dragMode,setDragMode]=useState(true),[ready,setReady]=useState(false);
 const[toolsOpen,setToolsOpen]=useState(false),[floating,setFloating]=useState<FloatingPoint>({x:0,y:0}),[draggingTools,setDraggingTools]=useState(false);
 const zoomLabel=useMemo(()=>`${zoom}%`,[zoom]);
 useEffect(()=>{if(window.location.pathname!=='/')return;const savedZoom=Number(localStorage.getItem(`${KEY}-zoom`)||'100');const savedContact=(localStorage.getItem(`${KEY}-contact-${cvId()}`)||'left')as ContactAlign;const savedHeader=(localStorage.getItem(`${KEY}-header-align-${cvId()}`)||'left')as ContactAlign;if(savedZoom>=60&&savedZoom<=160)setZoom(savedZoom);if(['left','center','right'].includes(savedContact))setContact(savedContact);if(['left','center','right'].includes(savedHeader))setHeaderAlign(savedHeader);setFloating(clampPoint(readFloatingPoint()));setReady(true);
  let observer:MutationObserver|undefined;let timer:number|undefined;
  const refresh=()=>{document.body.dataset.cvContact=(localStorage.getItem(`${KEY}-contact-${cvId()}`)||'left')as ContactAlign;document.body.dataset.cvHeaderAlign=(localStorage.getItem(`${KEY}-header-align-${cvId()}`)||'left')as ContactAlign;applyLayout(readLayout());applyHeaderOrder(readHeaderOrder())};
  const observe=()=>{observer?.disconnect();const target=document.querySelector('.preview-area')||document.body;observer=new MutationObserver(()=>{window.clearTimeout(timer);timer=window.setTimeout(refresh,30)});observer.observe(target,{childList:true,subtree:true});refresh()};
  const onResize=()=>{window.clearTimeout(timer);timer=window.setTimeout(()=>{setFloating(point=>clampPoint(point));refresh()},50)};window.addEventListener('resize',onResize);requestAnimationFrame(observe);return()=>{observer?.disconnect();window.removeEventListener('resize',onResize);window.clearTimeout(timer)}
 },[]);
 useEffect(()=>{if(!ready)return;localStorage.setItem(`${KEY}-zoom`,String(zoom));const paper=document.querySelector<HTMLElement>('.paper');if(paper)paper.style.setProperty('--cv-editor-zoom',String(zoom/100))},[zoom,ready]);
 useEffect(()=>{if(!ready)return;localStorage.setItem(`${KEY}-contact-${cvId()}`,contact);document.body.dataset.cvContact=contact},[contact,ready]);
 useEffect(()=>{if(!ready)return;localStorage.setItem(`${KEY}-header-align-${cvId()}`,headerAlign);document.body.dataset.cvHeaderAlign=headerAlign},[headerAlign,ready]);
 useEffect(()=>{if(!ready)return;localStorage.setItem(FLOAT_KEY,JSON.stringify(floating))},[floating,ready]);
 useEffect(()=>{if(!ready||!dragMode)return;const root=document.querySelector<HTMLElement>('.paper');if(!root)return;let dragging=false;
  const makeDraggable=()=>{root.querySelectorAll<HTMLElement>('.resume-section').forEach(el=>{el.draggable=true;el.dataset.cvKey=keyOf(el)});root.querySelectorAll<HTMLElement>('.resume-identity,.resume-head > .avatar').forEach(el=>{el.draggable=true;el.dataset.cvHeaderPart=el.classList.contains('avatar')?'avatar':'identity'})};
  const clearMarks=()=>root.querySelectorAll('.cv-drop-target,.cv-dragging,.cv-header-drop-target').forEach(x=>x.classList.remove('cv-drop-target','cv-dragging','cv-header-drop-target'));
  const onDragStart=(event:Event)=>{const ev=event as DragEvent;const target=(ev.target as HTMLElement).closest('.resume-section,.resume-identity,.resume-head > .avatar')as HTMLElement|null;if(!target)return;dragging=true;target.classList.add('cv-dragging');const hp=target.dataset.cvHeaderPart;if(hp)ev.dataTransfer?.setData('text/cv-header-part',hp);else ev.dataTransfer?.setData('text/cv-section',keyOf(target));if(ev.dataTransfer)ev.dataTransfer.effectAllowed='move'};
  const onDragOver=(event:Event)=>{const ev=event as DragEvent;const hp=ev.dataTransfer?.types.includes('text/cv-header-part');const target=(ev.target as HTMLElement).closest('.resume-section,.resume-head')as HTMLElement|null;if(!target)return;if(hp&&target.classList.contains('resume-head')){ev.preventDefault();target.classList.add('cv-header-drop-target');return}if(!hp&&target.classList.contains('resume-section')){ev.preventDefault();target.classList.add('cv-drop-target')}};
  const onDrop=(event:Event)=>{const ev=event as DragEvent;ev.preventDefault();const hp=ev.dataTransfer?.getData('text/cv-header-part')as HeaderPart|'';const target=(ev.target as HTMLElement).closest('.resume-section,.resume-head')as HTMLElement|null;if(hp&&target?.classList.contains('resume-head')){const source=root.querySelector<HTMLElement>(`[data-cv-header-part="${hp}"]`);const parts=Array.from(target.querySelectorAll<HTMLElement>(':scope > .resume-identity,:scope > .avatar'));const other=parts.find(x=>x!==source);if(source&&other){if(ev.clientX<other.getBoundingClientRect().left+other.getBoundingClientRect().width/2)target.insertBefore(source,other);else target.appendChild(source);writeHeaderOrder(Array.from(target.querySelectorAll<HTMLElement>(':scope > .resume-identity,:scope > .avatar')).map(x=>x.classList.contains('avatar')?'avatar':'identity'));clearMarks()}dragging=false;return}const sourceKey=ev.dataTransfer?.getData('text/cv-section');if(!sourceKey||!target?.classList.contains('resume-section'))return;const source=root.querySelector<HTMLElement>(`.resume-section[data-cv-key="${sourceKey}"]`);if(!source||source===target||!target.parentElement)return;const parent=target.parentElement;if(ev.clientY<target.getBoundingClientRect().top+target.getBoundingClientRect().height/2)parent.insertBefore(source,target);else parent.insertBefore(source,target.nextSibling);clearMarks();writeLayout(snapshot());applyLayout(readLayout());dragging=false};
  const onDragEnd=()=>{if(dragging){dragging=false;clearMarks()}};makeDraggable();root.addEventListener('dragstart',onDragStart);root.addEventListener('dragover',onDragOver);root.addEventListener('drop',onDrop);root.addEventListener('dragend',onDragEnd);const observer=new MutationObserver(makeDraggable);observer.observe(root,{childList:true,subtree:true});return()=>{root.removeEventListener('dragstart',onDragStart);root.removeEventListener('dragover',onDragOver);root.removeEventListener('drop',onDrop);root.removeEventListener('dragend',onDragEnd);observer.disconnect()}
 },[ready,dragMode]);
 useEffect(()=>{if(!ready)return;let active=false,moved=false,start={x:0,y:0},origin=floating;const move=(event:PointerEvent)=>{if(!active)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;setFloating(clampPoint({x:origin.x+dx,y:origin.y+dy}))};const up=()=>{if(!active)return;active=false;setDraggingTools(false);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);if(!moved)setToolsOpen(v=>!v)};const begin=(event:PointerEvent)=>{if((event.target as HTMLElement).closest('.cv-floating-tools button'))return;active=true;moved=false;start={x:event.clientX,y:event.clientY};origin=floating;setDraggingTools(true);(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up)};const fab=document.querySelector<HTMLElement>('.cv-floating-fab');if(!fab)return;fab.addEventListener('pointerdown',begin);return()=>{fab.removeEventListener('pointerdown',begin);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)}},[ready,floating]);
 if(!ready)return null;
 const changeZoom=(d:number)=>setZoom(v=>Math.max(60,Math.min(160,v+d)));
 const reset=()=>{localStorage.removeItem(storageKey());localStorage.removeItem(`${KEY}-header-${cvId()}`);applyLayout({});applyHeaderOrder(['identity','avatar']);setZoom(100);setContact('left');setHeaderAlign('left');setFloating(clampPoint({x:window.innerWidth-74,y:window.innerHeight-142}));setToolsOpen(false)};
 const style={left:floating.x,top:floating.y};
 return <div className={`cv-floating-shell ${toolsOpen?'is-open':''} ${draggingTools?'is-dragging':''}`} style={style}>
   <div className="cv-floating-tools" aria-label="CV page controls" aria-hidden={!toolsOpen}>
     <div className="cv-tools-head"><span>CV controls</span><button title="Close controls" onClick={()=>setToolsOpen(false)}><X size={15}/></button></div>
     <div className="cv-tools-grid">
       <div className="cv-tool-group"><span className="cv-tool-label">Zoom</span><div className="cv-tool-row"><button title="Zoom out" onClick={()=>changeZoom(-10)}><Minus size={14}/></button><strong>{zoomLabel}</strong><button title="Zoom in" onClick={()=>changeZoom(10)}><Plus size={14}/></button></div></div>
       <div className="cv-tool-group"><span className="cv-tool-label">Contact</span><div className="cv-tool-row"><button title="Contact left" className={contact==='left'?'active':''} onClick={()=>setContact('left')}>L</button><button title="Contact center" className={contact==='center'?'active':''} onClick={()=>setContact('center')}>C</button><button title="Contact right" className={contact==='right'?'active':''} onClick={()=>setContact('right')}>R</button></div></div>
       <div className="cv-tool-group"><span className="cv-tool-label">Header</span><div className="cv-tool-row"><button title="Header left" className={headerAlign==='left'?'active':''} onClick={()=>setHeaderAlign('left')}>L</button><button title="Header center" className={headerAlign==='center'?'active':''} onClick={()=>setHeaderAlign('center')}>C</button><button title="Header right" className={headerAlign==='right'?'active':''} onClick={()=>setHeaderAlign('right')}>R</button></div></div>
       <div className="cv-tool-group cv-tool-wide"><span className="cv-tool-label">Layout</span><div className="cv-tool-row"><button title={dragMode?'Disable CV content drag':'Enable CV content drag'} className={dragMode?'active':''} onClick={()=>setDragMode(v=>!v)}><GripVertical size={14}/><span>{dragMode?'Drag on':'Drag off'}</span></button><button title="Reset page layout" onClick={reset}><RotateCcw size={14}/></button></div></div>
     </div>
     <div className="cv-tools-tip"><GripVertical size={13}/> Drag the round button anywhere. Click it to open/close.</div>
   </div>
   <button className="cv-floating-fab" type="button" aria-label={toolsOpen?'Close CV controls':'Open CV controls'} title="Drag me • click to open" aria-expanded={toolsOpen}><span className="cv-fab-ring"/><SlidersHorizontal size={21}/></button>
 </div>
}
