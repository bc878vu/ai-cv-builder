'use client';

import { useEffect } from 'react';

/**
 * Export helper: configures the PDF.js worker used by CV file import.
 *
 * NOTE (2026-09-30): this component previously intercepted PDF/DOCX button
 * clicks and re-routed them through html2pdf.js / dom-docx. That broke both
 * exports:
 *  - PDF: html2canvas cannot parse the `color-mix()` used in the resume CSS,
 *    so rendering threw and the leftover `.html2pdf__overlay` covered the
 *    whole viewport, bricking the page until reload.
 *  - DOCX: dom-docx failures were swallowed by `.catch(()=>undefined)` and
 *    the interception blocked the working `docx`-library builder.
 * PDF now uses window.print() + print.css (reliable, selectable text =
 * genuinely ATS-friendly) and DOCX uses the `docx` builder in page.tsx.
 */
export default function ExportInterceptor() {
  useEffect(() => {
    let disposed = false;

    // Configure PDF.js once, using the worker generated locally during install.
    import('pdfjs-dist/legacy/build/pdf.mjs')
      .then((pdfjs) => {
        if (!disposed) pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      })
      .catch(() => undefined);

    // Safety net: remove any stale html2pdf overlay left behind by older
    // cached clients so it can never brick the page again.
    const cleanup = () => {
      document.querySelectorAll('.html2pdf__overlay').forEach((el) => el.remove());
    };
    cleanup();
    const timer = window.setInterval(cleanup, 5000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
