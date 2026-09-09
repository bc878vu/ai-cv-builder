export default function Loading() {
  return (
    <main className="global-loading-fallback" aria-label="Loading AI CV Builder">
      <div className="loading-logo"><span>AI</span><b>CV</b></div>
      <strong>AI CV Builder</strong>
      <span>Build smarter. Create a CV you’re proud to share.</span>
      <div className="loading-dots" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="loading-bar"><i /></div>
    </main>
  );
}
