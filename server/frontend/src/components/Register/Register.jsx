import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import '../Login/Login.css';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const register = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/djangoapp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'Registered') {
        setError(result.error || 'We could not create your account.');
        return;
      }
      sessionStorage.setItem('username', result.userName);
      navigate('/');
    } catch (requestError) {
      setError('Could not reach the server. Make sure Django is running.');
    }
  };

  return (
    <div>
      <Header />
      <main className="auth-page">
        <form className="auth-card register-card" onSubmit={register}>
          <p className="auth-eyebrow">Join Best Cars</p>
          <h1>Create an account</h1>
          <label htmlFor="register-username">Username</label>
          <input id="register-username" name="userName" autoComplete="username" required value={form.userName} onChange={updateField} />
          <div className="register-name-row">
            <div>
              <label htmlFor="register-first-name">First name</label>
              <input id="register-first-name" name="firstName" autoComplete="given-name" value={form.firstName} onChange={updateField} />
            </div>
            <div>
              <label htmlFor="register-last-name">Last name</label>
              <input id="register-last-name" name="lastName" autoComplete="family-name" value={form.lastName} onChange={updateField} />
            </div>
          </div>
          <label htmlFor="register-email">Email</label>
          <input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" required value={form.password} onChange={updateField} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-button" type="submit">Create account</button>
          <p className="auth-switch">Already have an account? <Link to="/login/">Sign in</Link></p>
        </form>
      </main>
    </div>
  );
};

export default Register;
