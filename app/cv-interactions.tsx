'use client';

import { useEffect, useMemo, useState } from 'react';
import { GripVertical, Minus, Plus, RotateCcw } from 'lucide-react';

type LayoutItem = { column: 'main' | 'side'; order: number };
type LayoutMap = Record<string, LayoutItem>;
type ContactAlign = 'left' | 'center' | 'right';
type HeaderPart = 'identity' | 'avatar';

const KEY = 'ai-cv-builder-layout-v3';
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

export default function CVInteractions(){
 const[zoom,setZoom]=useState(100),[contact,setContact]=useState<ContactAlign>('left'),[headerAlign,setHeaderAlign]=useState<ContactAlign>('left'),[dragMode,setDragMode]=useState(true),[ready,setReady]=useState(false);const zoomLabel=useMemo(()=>`${zoom}%`,[zoom]);
 useEffect(()=>{if(window.location.pathname!=='/')return;const savedZoom=Number(localStorage.getItem(`${KEY}-zoom`)||'100');const savedContact=(localStorage.getItem(`${KEY}-contact-${cvId()}`)||'left')as ContactAlign;const savedHeader=(localStorage.getItem(`${KEY}-header-align-${cvId()}`)||'left')as ContactAlign;if(savedZoom>=60&&savedZoom<=160)setZoom(savedZoom);if(['left','center','right'].includes(savedContact))setContact(savedContact);if(['left','center','right'].includes(savedHeader))setHeaderAlign(savedHeader);setReady(true);
  let observer:MutationObserver|undefined;let timer:number|undefined;
  const refresh=()=>{document.body.dataset.cvContact=(localStorage.getItem(`${KEY}-contact-${cvId()}`)||'left')as ContactAlign;document.body.dataset.cvHeaderAlign=(localStorage.getItem(`${KEY}-header-align-${cvId()}`)||'left')as ContactAlign;applyLayout(readLayout());applyHeaderOrder(readHeaderOrder())};
  const observe=()=>{observer?.disconnect();const target=document.querySelector('.preview-area')||document.body;observer=new MutationObserver(()=>{window.clearTimeout(timer);timer=window.setTimeout(refresh,30)});observer.observe(target,{childList:true,subtree:true});refresh()};
  const onResize=()=>{window.clearTimeout(timer);timer=window.setTimeout(refresh,50)};window.addEventListener('resize',onResize);requestAnimationFrame(observe);return()=>{observer?.disconnect();window.removeEventListener('resize',onResize);window.clearTimeout(timer)}
 },[]);
 useEffect(()=>{if(!ready)return;localStorage.setItem(`${KEY}-zoom`,String(zoom));const paper=document.querySelector<HTMLElement>('.paper');if(paper)paper.style.setProperty('--cv-editor-zoom',String(zoom/100))},[zoom,ready]);
 useEffect(()=>{if(!ready)return;localStorage.setItem(`${KEY}-contact-${cvId()}`,contact);document.body.dataset.cvContact=contact},[contact,ready]);
 useEffect(()=>{if(!ready)return;localStorage.setItem(`${KEY}-header-align-${cvId()}`,headerAlign);document.body.dataset.cvHeaderAlign=headerAlign},[headerAlign,ready]);
 useEffect(()=>{if(!ready||!dragMode)return;const root=document.querySelector<HTMLElement>('.paper');if(!root)return;let dragging=false;
  const makeDraggable=()=>{root.querySelectorAll<HTMLElement>('.resume-section').forEach(el=>{el.draggable=true;el.dataset.cvKey=keyOf(el)});root.querySelectorAll<HTMLElement>('.resume-identity,.resume-head > .avatar').forEach(el=>{el.draggable=true;el.dataset.cvHeaderPart=el.classList.contains('avatar')?'avatar':'identity'})};
  const clearMarks=()=>root.querySelectorAll('.cv-drop-target,.cv-dragging,.cv-header-drop-target').forEach(x=>x.classList.remove('cv-drop-target','cv-dragging','cv-header-drop-target'));
  const onDragStart=(event:Event)=>{const ev=event as DragEvent;const target=(ev.target as HTMLElement).closest('.resume-section,.resume-identity,.resume-head > .avatar')as HTMLElement|null;if(!target)return;dragging=true;target.classList.add('cv-dragging');const hp=target.dataset.cvHeaderPart;if(hp)ev.dataTransfer?.setData('text/cv-header-part',hp);else ev.dataTransfer?.setData('text/cv-section',keyOf(target));if(ev.dataTransfer)ev.dataTransfer.effectAllowed='move'};
  const onDragOver=(event:Event)=>{const ev=event as DragEvent;const hp=ev.dataTransfer?.types.includes('text/cv-header-part');const target=(ev.target as HTMLElement).closest('.resume-section,.resume-head')as HTMLElement|null;if(!target)return;if(hp&&target.classList.contains('resume-head')){ev.preventDefault();target.classList.add('cv-header-drop-target');return}if(!hp&&target.classList.contains('resume-section')){ev.preventDefault();target.classList.add('cv-drop-target')}};
  const onDrop=(event:Event)=>{const ev=event as DragEvent;ev.preventDefault();const hp=ev.dataTransfer?.getData('text/cv-header-part')as HeaderPart|'';const target=(ev.target as HTMLElement).closest('.resume-section,.resume-head')as HTMLElement|null;if(hp&&target?.classList.contains('resume-head')){const source=root.querySelector<HTMLElement>(`[data-cv-header-part="${hp}"]`);const parts=Array.from(target.querySelectorAll<HTMLElement>(':scope > .resume-identity,:scope > .avatar'));const other=parts.find(x=>x!==source);if(source&&other){if(ev.clientX<other.getBoundingClientRect().left+other.getBoundingClientRect().width/2)target.insertBefore(source,other);else target.appendChild(source);writeHeaderOrder(Array.from(target.querySelectorAll<HTMLElement>(':scope > .resume-identity,:scope > .avatar')).map(x=>x.classList.contains('avatar')?'avatar':'identity'));clearMarks()}dragging=false;return}const sourceKey=ev.dataTransfer?.getData('text/cv-section');if(!sourceKey||!target?.classList.contains('resume-section'))return;const source=root.querySelector<HTMLElement>(`.resume-section[data-cv-key="${sourceKey}"]`);if(!source||source===target||!target.parentElement)return;const parent=target.parentElement;if(ev.clientY<target.getBoundingClientRect().top+target.getBoundingClientRect().height/2)parent.insertBefore(source,target);else parent.insertBefore(source,target.nextSibling);clearMarks();writeLayout(snapshot());applyLayout(readLayout());dragging=false};
  const onDragEnd=()=>{if(dragging){dragging=false;clearMarks()}};makeDraggable();root.addEventListener('dragstart',onDragStart);root.addEventListener('dragover',onDragOver);root.addEventListener('drop',onDrop);root.addEventListener('dragend',onDragEnd);const observer=new MutationObserver(makeDraggable);observer.observe(root,{childList:true,subtree:true});return()=>{root.removeEventListener('dragstart',onDragStart);root.removeEventListener('dragover',onDragOver);root.removeEventListener('drop',onDrop);root.removeEventListener('dragend',onDragEnd);observer.disconnect()}
 },[ready,dragMode]);
 if(!ready)return null;const changeZoom=(d:number)=>setZoom(v=>Math.max(60,Math.min(160,v+d)));const reset=()=>{localStorage.removeItem(storageKey());localStorage.removeItem(`${KEY}-header-${cvId()}`);applyLayout({});applyHeaderOrder(['identity','avatar']);setZoom(100);setContact('left');setHeaderAlign('left')};
 return <div className="cv-floating-tools" aria-label="CV page controls"><button title="Zoom out" onClick={()=>changeZoom(-10)}><Minus size={14}/></button><span>{zoomLabel}</span><button title="Zoom in" onClick={()=>changeZoom(10)}><Plus size={14}/></button><span className="cv-tool-divider"/><button title="Contact left" className={contact==='left'?'active':''} onClick={()=>setContact('left')}>L</button><button title="Contact center" className={contact==='center'?'active':''} onClick={()=>setContact('center')}>C</button><button title="Contact right" className={contact==='right'?'active':''} onClick={()=>setContact('right')}>R</button><span className="cv-tool-divider"/><button title="Header left" className={headerAlign==='left'?'active':''} onClick={()=>setHeaderAlign('left')}>HL</button><button title="Header center" className={headerAlign==='center'?'active':''} onClick={()=>setHeaderAlign('center')}>HC</button><button title="Header right" className={headerAlign==='right'?'active':''} onClick={()=>setHeaderAlign('right')}>HR</button><span className="cv-tool-divider"/><button title={dragMode?'Disable drag':'Enable drag'} className={dragMode?'active':''} onClick={()=>setDragMode(v=>!v)}><GripVertical size={14}/></button><button title="Reset page layout" onClick={reset}><RotateCcw size={14}/></button></div>
}
