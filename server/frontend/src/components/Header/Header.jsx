import React from 'react';
import "../assets/style.css";
import "../assets/bootstrap.min.css";

const Header = () => {
  const logout = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/djangoapp/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Sign out failed.');
      }
      sessionStorage.removeItem('username');
      window.location.assign('/');
    } catch (error) {
      alert('Could not sign out. Please try again.');
    }
  };

  const username = sessionStorage.getItem('username');
  const accountLinks = username
    ? <div className="input_panel"><span className="username">{username}</span><a className="nav_item" href="/" onClick={logout}>Sign out</a></div>
    : <div className="input_panel"><a className="nav_item" href="/login/">Sign in</a><a className="nav_item" href="/register/">Create account</a></div>;

    return (
        <div>
          <nav className="navbar navbar-expand-lg navbar-light" style={{backgroundColor:"darkturquoise", minHeight:"76px"}}>
            <div className="container-fluid">
              <h2 style={{paddingRight: "5%"}}>Dealerships</h2>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarText">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a className="nav-link active" style={{fontSize: "larger"}} aria-current="page" href="/">Home</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" style={{fontSize: "larger"}} href="/dealers">Dealerships</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" style={{fontSize: "larger"}} href="/about/">About Us</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" style={{fontSize: "larger"}} href="/contact/">Contact Us</a>
                  </li>
                </ul>
                <div className="navbar-text" id="loginlogout">{accountLinks}</div>
              </div>
            </div>
          </nav>
        </div>
    )
}

export default Header
