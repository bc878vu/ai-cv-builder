'use client';

import { useEffect } from 'react';

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileName() {
  return (document.querySelector('.resume-head h1')?.textContent || 'cv')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'cv';
}

export default function ExportInterceptor() {
  useEffect(() => {
    let disposed = false;

    // Configure PDF.js once, using the worker generated locally during install.
    import('pdfjs-dist/legacy/build/pdf.mjs')
      .then((pdfjs) => {
        if (!disposed) pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      })
      .catch(() => undefined);

    const exportPDF = async () => {
      const paper = document.querySelector('.paper') as HTMLElement | null;
      if (!paper) return;
      const mod: any = await import('html2pdf.js');
      const html2pdf = mod.default || mod;
      const worker = html2pdf().set({
        margin: 0,
        filename: `${safeFileName()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.resume-section', '.avatar'] },
      }).from(paper);

      await worker.toPdf().get('pdf').then((pdf: any) => {
        const total = pdf.internal.getNumberOfPages();
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        for (let page = 1; page <= total; page += 1) {
          pdf.setPage(page);
          pdf.text(`Page ${page} of ${total}`, 105, 291, { align: 'center' });
        }
      });
      await worker.save();
    };

    const exportDOCX = async () => {
      const paper = document.querySelector('.paper') as HTMLElement | null;
      if (!paper) return;
      const { convertHtmlToDocx } = await import('dom-docx/browser');
      const blob = await convertHtmlToDocx(paper.innerHTML, {
        pageSize: 'A4',
        orientation: 'portrait',
        styleSource: 'computed',
        root: paper,
        margins: { top: 0.55, right: 0.55, bottom: 0.55, left: 0.55 },
        metadata: { title: document.querySelector('.resume-head h1')?.textContent || 'CV', creator: 'AI CV Builder' },
      });
      downloadBlob(blob, `${safeFileName()}.docx`);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('button');
      if (!button) return;
      const label = (button.textContent || '').trim().toUpperCase();
      if (label.includes('PDF')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        exportPDF().catch(() => window.print());
      } else if (label.includes('DOCX')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        exportDOCX().catch(() => undefined);
      }
    };

    document.addEventListener('click', onClick, true);
    return () => {
      disposed = true;
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
