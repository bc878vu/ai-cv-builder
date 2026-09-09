import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy', description: 'Privacy information for AI CV Builder.' };

export default function PrivacyPage() {
  return <main className="legal-page"><span className="eyebrow">LEGAL</span><h1>Privacy Policy</h1><p className="legal-lead">AI CV Builder is designed to keep ordinary CV editing local in your browser whenever possible.</p><section><h2>CV data and local storage</h2><p>CV drafts, design choices and imported CV content are stored in your browser for the current workspace. Clearing browser storage can remove locally saved drafts.</p></section><section><h2>AI requests</h2><p>When you use an AI feature, the relevant CV content and job description are sent to the configured AI provider through the application server so a response can be generated. The application does not put a private API key in the browser.</p></section><section><h2>Uploaded files and photos</h2><p>Profile photos and imported documents are processed in the browser for the editor workflow. Keep sensitive documents under your control and only use AI features when you are comfortable sending the relevant text to the configured provider.</p></section><section><h2>Contact</h2><p>For privacy questions, contact a.m.a63425@gmail.com.</p></section><small>Last updated: September 9, 2026</small></main>;
}
