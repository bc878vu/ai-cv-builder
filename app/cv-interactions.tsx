'use client';

import { useEffect, useMemo, useState } from 'react';
import { GripVertical, Minus, Plus, RotateCcw } from 'lucide-react';

type LayoutItem = { column: 'main' | 'side'; order: number };
type LayoutMap = Record<string, LayoutItem>;
type ContactAlign = 'left' | 'center' | 'right';
type HeaderPart = 'identity' | 'avatar';

const KEY = 'ai-cv-builder-layout-v3';
const headingToKey: Record<string, string> = {
  PROFILE: 'profile', EXPERIENCE: 'experience', PROJECTS: 'projects', SKILLS: 'skills',
  EDUCATION: 'education', CERTIFICATIONS: 'certifications', LANGUAGES: 'languages', INTERESTS: 'interests',
};

function cvId() { return new URLSearchParams(window.location.search).get('cv') || 'cv-1'; }
function storageKey() { return `${KEY}-${cvId()}`; }
function readLayout(): LayoutMap { try { return JSON.parse(localStorage.getItem(storageKey()) || '{}'); } catch { return {}; } }
function writeLayout(value: LayoutMap) { localStorage.setItem(storageKey(), JSON.stringify(value)); }
function keyOf(el: Element) { return headingToKey[el.querySelector('h3')?.textContent?.trim().toUpperCase() || ''] || ''; }
function snapshot(): LayoutMap {
  const result: LayoutMap = {};
  document.querySelectorAll<HTMLElement>('.resume-main,.resume-side').forEach(parent => {
    const column = parent.classList.contains('resume-side') ? 'side' : 'main';
    Array.from(parent.children).forEach((el, index) => {
      const key = keyOf(el);
      if (key) result[key] = { column, order: index };
    });
  });
  return result;
}
function applyLayout(layout: LayoutMap) {
  const paper = document.querySelector('.paper');
  const main = paper?.querySelector<HTMLElement>('.resume-main');
  const side = paper?.querySelector<HTMLElement>('.resume-side');
  if (!main || !side) return;
  const nodes = new Map<string, HTMLElement>();
  paper.querySelectorAll<HTMLElement>('.resume-section').forEach(el => {
    const key = keyOf(el);
    if (key) nodes.set(key, el);
  });
  Object.entries(layout).forEach(([key, item]) => {
    const el = nodes.get(key), parent = item.column === 'side' ? side : main;
    if (el && el.parentElement !== parent) parent.appendChild(el);
  });
  [main, side].forEach(parent => {
    Array.from(parent.children)
      .sort((a, b) => (layout[keyOf(a)]?.order ?? 999) - (layout[keyOf(b)]?.order ?? 999))
      .forEach(el => parent.appendChild(el));
  });
}

function readHeaderOrder(): HeaderPart[] {
  try {
    const value = JSON.parse(localStorage.getItem(`${KEY}-header-${cvId()}`) || 'null');
    if (Array.isArray(value) && value.every(x => x === 'identity' || x === 'avatar')) return value;
  } catch {}
  return ['identity', 'avatar'];
}
function writeHeaderOrder(value: HeaderPart[]) { localStorage.setItem(`${KEY}-header-${cvId()}`, JSON.stringify(value)); }
function applyHeaderOrder(order: HeaderPart[]) {
  const head = document.querySelector<HTMLElement>('.resume-head');
  if (!head) return;
  const identity = head.querySelector<HTMLElement>('.resume-identity');
  const avatar = head.querySelector<HTMLElement>('.avatar');
  if (!identity || !avatar) return;
  order.forEach(key => head.appendChild(key === 'identity' ? identity : avatar));
}

export default function CVInteractions() {
  const [zoom, setZoom] = useState(100);
  const [contact, setContact] = useState<ContactAlign>('left');
  const [headerAlign, setHeaderAlign] = useState<ContactAlign>('left');
  const [dragMode, setDragMode] = useState(true);
  const [ready, setReady] = useState(false);
  const zoomLabel = useMemo(() => `${zoom}%`, [zoom]);

  useEffect(() => {
    if (window.location.pathname !== '/') return;
    const savedZoom = Number(localStorage.getItem(`${KEY}-zoom`) || '100');
    const savedContact = (localStorage.getItem(`${KEY}-contact-${cvId()}`) || 'left') as ContactAlign;
    const savedHeader = (localStorage.getItem(`${KEY}-header-align-${cvId()}`) || 'left') as ContactAlign;
    if (savedZoom >= 60 && savedZoom <= 160) setZoom(savedZoom);
    if (['left', 'center', 'right'].includes(savedContact)) setContact(savedContact);
    if (['left', 'center', 'right'].includes(savedHeader)) setHeaderAlign(savedHeader);
    setReady(true);

    let observer: MutationObserver | undefined;
    const refresh = () => {
      const currentContact = (localStorage.getItem(`${KEY}-contact-${cvId()}`) || 'left') as ContactAlign;
      const currentHeader = (localStorage.getItem(`${KEY}-header-align-${cvId()}`) || 'left') as ContactAlign;
      document.body.dataset.cvContact = currentContact;
      document.body.dataset.cvHeaderAlign = currentHeader;
      applyLayout(readLayout());
      applyHeaderOrder(readHeaderOrder());
    };
    const start = () => {
      refresh();
      observer = new MutationObserver(() => {
        observer?.disconnect();
        requestAnimationFrame(() => {
          refresh();
          if (observer) observer.observe(document.querySelector('.preview-area') || document.body, { childList: true, subtree: true });
        });
      });
      observer.observe(document.querySelector('.preview-area') || document.body, { childList: true, subtree: true });
    };
    requestAnimationFrame(start);
    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(`${KEY}-zoom`, String(zoom));
    const paper = document.querySelector<HTMLElement>('.paper');
    if (paper) paper.style.setProperty('--cv-editor-zoom', String(zoom / 100));
  }, [zoom, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(`${KEY}-contact-${cvId()}`, contact);
    document.body.dataset.cvContact = contact;
  }, [contact, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(`${KEY}-header-align-${cvId()}`, headerAlign);
    document.body.dataset.cvHeaderAlign = headerAlign;
  }, [headerAlign, ready]);

  useEffect(() => {
    if (!ready || !dragMode) return;
    const root = document.querySelector('.paper');
    if (!root) return;
    let dragging = false;

    const makeDraggable = () => {
      root.querySelectorAll<HTMLElement>('.resume-section').forEach(el => {
        el.draggable = true;
        el.dataset.cvKey = keyOf(el);
      });
      root.querySelectorAll<HTMLElement>('.resume-identity,.resume-head > .avatar').forEach(el => {
        el.draggable = true;
        el.dataset.cvHeaderPart = el.classList.contains('avatar') ? 'avatar' : 'identity';
      });
    };

    const clearMarks = () => root.querySelectorAll('.cv-drop-target,.cv-dragging,.cv-header-drop-target').forEach(x => x.classList.remove('cv-drop-target', 'cv-dragging', 'cv-header-drop-target'));

    const onDragStart = (event: Event) => {
      const ev = event as DragEvent;
      const target = (ev.target as HTMLElement).closest('.resume-section,.resume-identity,.resume-head > .avatar') as HTMLElement | null;
      if (!target) return;
      dragging = true;
      target.classList.add('cv-dragging');
      const headerPart = target.dataset.cvHeaderPart;
      if (headerPart) ev.dataTransfer?.setData('text/cv-header-part', headerPart);
      else ev.dataTransfer?.setData('text/cv-section', keyOf(target));
      if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (event: Event) => {
      const ev = event as DragEvent;
      const headerPart = ev.dataTransfer?.types.includes('text/cv-header-part');
      const target = (ev.target as HTMLElement).closest('.resume-section,.resume-head') as HTMLElement | null;
      if (!target) return;
      if (headerPart && target.classList.contains('resume-head')) {
        ev.preventDefault();
        target.classList.add('cv-header-drop-target');
        return;
      }
      if (!headerPart && target.classList.contains('resume-section')) {
        ev.preventDefault();
        target.classList.add('cv-drop-target');
      }
    };

    const onDrop = (event: Event) => {
      const ev = event as DragEvent;
      ev.preventDefault();
      const headerPart = ev.dataTransfer?.getData('text/cv-header-part') as HeaderPart | '';
      const target = (ev.target as HTMLElement).closest('.resume-section,.resume-head') as HTMLElement | null;

      if (headerPart && target?.classList.contains('resume-head')) {
        const source = root.querySelector<HTMLElement>(`[data-cv-header-part="${headerPart}"]`);
        const headParts = Array.from(target.querySelectorAll<HTMLElement>(':scope > .resume-identity, :scope > .avatar'));
        const other = headParts.find(x => x !== source);
        if (source && other) {
          if (ev.clientX < other.getBoundingClientRect().left + other.getBoundingClientRect().width / 2) target.insertBefore(source, other);
          else target.appendChild(source);
          writeHeaderOrder(Array.from(target.querySelectorAll<HTMLElement>(':scope > .resume-identity, :scope > .avatar')).map(x => x.classList.contains('avatar') ? 'avatar' : 'identity'));
          clearMarks();
        }
        dragging = false;
        return;
      }

      const sourceKey = ev.dataTransfer?.getData('text/cv-section');
      if (!sourceKey || !target?.classList.contains('resume-section')) return;
      const source = root.querySelector<HTMLElement>(`.resume-section[data-cv-key="${sourceKey}"]`);
      if (!source || source === target || !target.parentElement) return;
      const parent = target.parentElement;
      if (ev.clientY < target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2) parent.insertBefore(source, target);
      else parent.insertBefore(source, target.nextSibling);
      clearMarks();
      writeLayout(snapshot());
      applyLayout(readLayout());
      dragging = false;
    };

    const onDragEnd = () => { if (dragging) { dragging = false; clearMarks(); } };
    makeDraggable();
    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop);
    root.addEventListener('dragend', onDragEnd);
    const observer = new MutationObserver(makeDraggable);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      root.removeEventListener('dragstart', onDragStart);
      root.removeEventListener('dragover', onDragOver);
      root.removeEventListener('drop', onDrop);
      root.removeEventListener('dragend', onDragEnd);
      observer.disconnect();
    };
  }, [ready, dragMode]);

  if (!ready) return null;
  const changeZoom = (delta: number) => setZoom(v => Math.max(60, Math.min(160, v + delta)));
  const reset = () => {
    localStorage.removeItem(storageKey());
    localStorage.removeItem(`${KEY}-header-${cvId()}`);
    applyLayout({});
    applyHeaderOrder(['identity', 'avatar']);
    setZoom(100);
    setContact('left');
    setHeaderAlign('left');
  };

  return <div className="cv-floating-tools" aria-label="CV page controls">
    <button title="Zoom out" onClick={() => changeZoom(-10)}><Minus size={14}/></button>
    <span>{zoomLabel}</span>
    <button title="Zoom in" onClick={() => changeZoom(10)}><Plus size={14}/></button>
    <span className="cv-tool-divider"/>
    <button title="Contact left" className={contact === 'left' ? 'active' : ''} onClick={() => setContact('left')}>L</button>
    <button title="Contact center" className={contact === 'center' ? 'active' : ''} onClick={() => setContact('center')}>C</button>
    <button title="Contact right" className={contact === 'right' ? 'active' : ''} onClick={() => setContact('right')}>R</button>
    <span className="cv-tool-divider"/>
    <button title="Header left" className={headerAlign === 'left' ? 'active' : ''} onClick={() => setHeaderAlign('left')}>HL</button>
    <button title="Header center" className={headerAlign === 'center' ? 'active' : ''} onClick={() => setHeaderAlign('center')}>HC</button>
    <button title="Header right" className={headerAlign === 'right' ? 'active' : ''} onClick={() => setHeaderAlign('right')}>HR</button>
    <span className="cv-tool-divider"/>
    <button title={dragMode ? 'Disable drag' : 'Enable drag'} className={dragMode ? 'active' : ''} onClick={() => setDragMode(v => !v)}><GripVertical size={14}/></button>
    <button title="Reset page layout" onClick={reset}><RotateCcw size={14}/></button>
  </div>;
}
