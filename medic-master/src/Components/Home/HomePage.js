import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="background-image"></div>
      <div className="content">
        <h1>Medic Master</h1>
        <b><p>Step into a world of care and comfort. We are here to nurture your health journey. Welcome!</p></b>
        <nav>
          <Link to="/register" className="nav-button register-button">
          <b>Register</b>
          </Link>
          <Link to="/login" className="nav-button login-button">
          <b>Login</b>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default HomePage;
