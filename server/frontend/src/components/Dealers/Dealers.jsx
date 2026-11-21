import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import './Dealers.css';

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [state, setState] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoggedIn = Boolean(sessionStorage.getItem('username'));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const endpoint = state === 'All'
      ? '/djangoapp/get_dealers'
      : `/djangoapp/get_dealers/${encodeURIComponent(state)}`;

    fetch(endpoint)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load dealerships.');
        return result.dealers || [];
      })
      .then((items) => {
        if (!active) return;
        setDealers(items);
        setStates((current) => current.length ? current : [...new Set(items.map((dealer) => dealer.state))].sort());
      })
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [state]);

  return (
    <div>
      <Header />
      <main className="dealers-page">
        <div className="dealers-heading">
          <div>
            <p className="auth-eyebrow">Best Cars network</p>
            <h1>Find a dealership</h1>
            <p>Browse locations and hear from people who have bought there.</p>
          </div>
          <label className="state-filter" htmlFor="state-filter">
            Filter by state
            <select id="state-filter" value={state} onChange={(event) => setState(event.target.value)}>
              <option value="All">All states</option>
              {states.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {loading && <p role="status">Loading dealerships…</p>}
        {error && <p className="auth-error" role="alert">{error} Check that the Django server and dealership database are running.</p>}
        {!loading && !error && dealers.length === 0 && <p>No dealerships found for this state.</p>}
        {!loading && !error && dealers.length > 0 && (
          <div className="dealers-grid">
            {dealers.map((dealer) => (
              <article className="dealer-card" key={dealer.id}>
                <p className="dealer-location">{dealer.city}, {dealer.state}</p>
                <h2><Link to={`/dealer/${dealer.id}`}>{dealer.full_name}</Link></h2>
                <p>{dealer.address}<br />{dealer.city}, {dealer.st || dealer.state} {dealer.zip}</p>
                <div className="dealer-card-actions">
                  <Link to={`/dealer/${dealer.id}`}>Read reviews</Link>
                  {isLoggedIn && <Link to={`/postreview/${dealer.id}`}>Write a review</Link>}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
