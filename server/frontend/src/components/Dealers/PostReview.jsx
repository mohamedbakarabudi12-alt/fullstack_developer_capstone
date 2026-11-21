import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../Header/Header';
import './Dealers.css';

export default function PostReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({ review: '', purchase_date: '', car_make: '', car_model: '', car_year: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/djangoapp/dealer/${id}`).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load dealership.');
        return result.dealer?.[0];
      }),
      fetch('/djangoapp/get_cars').then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load car models.');
        return result.CarModels || [];
      }),
    ])
      .then(([dealerDetails, carModels]) => {
        if (!active) return;
        setDealer(dealerDetails);
        setCars(carModels);
      })
      .catch((requestError) => active && setError(requestError.message));
    return () => { active = false; };
  }, [id]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitReview = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/djangoapp/add_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dealership: id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit your review.');
      navigate(`/dealer/${id}`);
    } catch (requestError) {
      setError(requestError.message || 'Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionStorage.getItem('username')) {
    return <><Header /><main className="dealers-page"><p>Please <Link to="/login/">sign in</Link> before posting a review.</p></main></>;
  }

  return (
    <div>
      <Header />
      <main className="dealers-page">
        <Link className="back-link" to={`/dealer/${id}`}>← Back to dealership</Link>
        <p className="auth-eyebrow">Share your experience</p>
        <h1>{dealer ? `Review ${dealer.full_name}` : 'Write a review'}</h1>
        <form className="review-form" onSubmit={submitReview}>
          <label htmlFor="review-text">Your review</label>
          <textarea id="review-text" name="review" rows="5" maxLength="2000" required value={form.review} onChange={updateField} />
          <div className="review-form-row">
            <div>
              <label htmlFor="purchase-date">Purchase date</label>
              <input id="purchase-date" name="purchase_date" type="date" required value={form.purchase_date} onChange={updateField} />
            </div>
            <div>
              <label htmlFor="car-year">Car year</label>
              <input id="car-year" name="car_year" type="number" min="1900" max="2035" required value={form.car_year} onChange={updateField} />
            </div>
          </div>
          <label htmlFor="car-model">Car make and model</label>
          <select id="car-model" required value={form.car_make && form.car_model ? `${form.car_make}|${form.car_model}` : ''} onChange={(event) => {
            const [car_make, car_model] = event.target.value.split('|');
            setForm((current) => ({ ...current, car_make, car_model }));
          }}>
            <option value="" disabled>Select a car</option>
            {cars.map((car) => <option key={`${car.CarMake}-${car.CarModel}`} value={`${car.CarMake}|${car.CarModel}`}>{car.CarMake} {car.CarModel}</option>)}
          </select>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
        </form>
      </main>
    </div>
  );
}
