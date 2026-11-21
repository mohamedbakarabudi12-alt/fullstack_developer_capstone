import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../Header/Header';
import positiveIcon from '../assets/positive.png';
import neutralIcon from '../assets/neutral.png';
import negativeIcon from '../assets/negative.png';
import './Dealers.css';

export default function Dealer() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const isLoggedIn = Boolean(sessionStorage.getItem('username'));

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/djangoapp/dealer/${id}`).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load dealership.');
        return result.dealer?.[0];
      }),
      fetch(`/djangoapp/reviews/dealer/${id}`).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load reviews.');
        return result.reviews || [];
      }),
    ])
      .then(([dealerDetails, dealerReviews]) => {
        if (!active) return;
        setDealer(dealerDetails);
        setReviews(dealerReviews);
      })
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const sentimentIcon = (sentiment) => sentiment === 'positive'
    ? positiveIcon : sentiment === 'negative' ? negativeIcon : neutralIcon;

  return (
    <div>
      <Header />
      <main className="dealers-page">
        <Link className="back-link" to="/dealers">← All dealerships</Link>
        {loading && <p role="status">Loading dealership and reviews…</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {!loading && !error && dealer && <>
          <div className="dealers-heading">
            <div>
              <p className="auth-eyebrow">{dealer.city}, {dealer.state}</p>
              <h1>{dealer.full_name}</h1>
              <p>{dealer.address}, {dealer.city}, {dealer.st || dealer.state} {dealer.zip}</p>
            </div>
            {isLoggedIn && <Link className="auth-button home-button" to={`/postreview/${dealer.id}`}>Write a review</Link>}
          </div>
          <h2 className="section-title">Customer reviews</h2>
          {reviews.length === 0 ? <p>No reviews yet. Be the first to share your experience.</p> : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <article className="customer-review" key={review.id}>
                  <img src={sentimentIcon(review.sentiment)} className="emotion_icon" alt={`${review.sentiment || 'neutral'} sentiment`} />
                  <p className="review-copy">“{review.review}”</p>
                  <p className="reviewer">{review.name} · {review.car_year} {review.car_make} {review.car_model}</p>
                </article>
              ))}
            </div>
          )}
        </>}
      </main>
    </div>
  );
}
