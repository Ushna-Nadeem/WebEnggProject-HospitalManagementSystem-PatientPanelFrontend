import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="header-bar-dashboard">
        <button className="logout-button" onClick={handleLogout}>
          <b>Logout</b>
        </button>
      </div>
      <h2>Dashboard</h2>
      <div className="dashboard-options">
        <Link to="/dashboard/profile">
          <img
            className="option-icon"
            src="\images\profile.png"
            alt="Profile"
          />
          My Profile
        </Link>
        <Link to="/dashboard/appointments">
          <img
            className="option-icon"
            src="\images\appointment.jpeg"
            alt="Appointments"
          />
          Appointments
        </Link>
        <Link to="/dashboard/prescriptions">
          <img
            className="option-icon"
            src="\images\prescription.jpeg"
            alt="Prescriptions"
          />
          Prescriptions
        </Link>
        <Link to="/dashboard/testresults">
          <img
            className="option-icon"
            src="\images\testresult.jpeg"
            alt="Test Results"
          />
          Test Results
        </Link>
        <Link to="/dashboard/billing&payment">
          <img
            className="option-icon"
            src="\images\payment.jpeg"
            alt="Payment"
          />
          Bills Payment
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
