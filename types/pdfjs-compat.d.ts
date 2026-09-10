import type { DocumentInitParameters, PDFDocumentLoadingTask } from 'pdfjs-dist/types/src/display/api';

declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  export function getDocument(src?: DocumentInitParameters & { disableWorker?: boolean }): PDFDocumentLoadingTask;
}
