declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  type LegacyDocumentInitParameters = { data?: unknown; disableWorker?: boolean; [key:string]: unknown };
  export function getDocument(src?: LegacyDocumentInitParameters): any;
}
