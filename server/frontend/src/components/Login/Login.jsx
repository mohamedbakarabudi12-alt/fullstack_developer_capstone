import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import "./Login.css";
import Header from '../Header/Header';

const Login = () => {

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const loginUrl = "/djangoapp/login";

  const login = async (e) => {
    e.preventDefault();

    setError("");
    try {
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "userName": userName,
            "password": password
        }),
      });
      const json = await res.json();
      if (res.ok && json.status === "Authenticated") {
        sessionStorage.setItem('username', json.userName);
        navigate('/');
      } else {
        setError(json.error || "The user could not be authenticated.");
      }
    } catch (requestError) {
      setError("Could not reach the server. Make sure Django is running.");
    }
};

  return (
    <div>
      <Header/>
      <main className="auth-page">
        <form className="auth-card" onSubmit={login}>
          <p className="auth-eyebrow">Welcome back</p>
          <h1>Sign in</h1>
          <label htmlFor="login-username">Username</label>
          <input id="login-username" type="text" autoComplete="username" required value={userName} onChange={(e) => setUserName(e.target.value)} />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-button" type="submit">Sign in</button>
          <p className="auth-switch">New to Best Cars? <Link to="/register/">Create an account</Link></p>
        </form>
      </main>
    </div>
  );
};

export default Login;
