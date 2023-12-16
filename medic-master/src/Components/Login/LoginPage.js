import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/patients/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in local storage upon successful login
        localStorage.setItem('token', data.token);

        // Redirect to the dashboard upon successful login
        navigate('/dashboard');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error(error);
      setMessage('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="body-login">
      <div className="background-container-login"></div>
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password: </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit"><b>Login</b></button>
        </form>

        {message && <p>{message}</p>}

        <Link to="/" className="back-to-home">
          <b>Back to Homepage</b>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
