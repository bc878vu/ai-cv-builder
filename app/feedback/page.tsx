'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, Send, MessageSquareQuote } from 'lucide-react';

type Review = { id: string; name: string; rating: number; review: string; created_at: string };

export default function FeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const average = useMemo(() => reviews.length ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1) : '—', [reviews]);

  useEffect(() => {
    fetch('/api/feedback', { cache: 'no-store' }).then((res) => res.json()).then((data) => setReviews(Array.isArray(data.reviews) ? data.reviews : [])).catch(() => setReviews([])).finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Submitting…');
    const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, rating, review }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus(data.message ?? 'Could not submit feedback.'); return; }
    if (data.review) setReviews((current) => [data.review, ...current]);
    setName(''); setRating(5); setReview(''); setStatus('Thanks! Your review is now public.');
  }

  return <main className="public-page feedback-page">
    <section className="public-hero compact"><span className="eyebrow">COMMUNITY FEEDBACK</span><h1>What do you think?</h1><p>Rate AI CV Builder and share your experience. Public reviews help other visitors understand the product before they start.</p><div className="feedback-summary"><strong>{average}</strong><span>{reviews.length ? `${reviews.length} public review${reviews.length === 1 ? '' : 's'}` : 'Be the first to review'}</span></div></section>
    <section className="feedback-layout">
      <form className="feedback-form" onSubmit={submit}><div><span className="eyebrow">LEAVE A REVIEW</span><h2>Your feedback matters</h2></div><label>Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="Your name" /></label><fieldset><legend>Rating</legend><div className="star-picker">{[1,2,3,4,5].map((value) => <button type="button" key={value} className={value <= rating ? 'selected' : ''} onClick={() => setRating(value)} aria-label={`${value} stars`}><Star size={24} fill="currentColor" /></button>)}</div></fieldset><label>Review<textarea value={review} onChange={(e) => setReview(e.target.value)} maxLength={1000} required rows={6} placeholder="Tell us what you liked or what should be improved…" /></label><button className="public-primary" type="submit"><Send size={16}/> Publish review</button>{status && <p className="form-status">{status}</p>}</form>
      <section className="reviews-panel"><div className="section-heading"><div><span className="eyebrow">PUBLIC REVIEWS</span><h2>Visitor experiences</h2></div><MessageSquareQuote size={24}/></div>{loading ? <p>Loading reviews…</p> : reviews.length ? <div className="review-list">{reviews.map((item) => <article className="review-card" key={item.id}><div className="review-top"><strong>{item.name}</strong><span>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span></div><p>{item.review}</p><small>{new Date(item.created_at).toLocaleDateString()}</small></article>)}</div> : <div className="empty-reviews"><MessageSquareQuote size={28}/><h3>No public reviews yet</h3><p>Be the first visitor to share feedback.</p></div>}</section>
    </section>
  </main>;
}
