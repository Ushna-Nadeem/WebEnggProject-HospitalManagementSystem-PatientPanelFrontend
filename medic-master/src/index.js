import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Components/Home/HomePage';
import RegisterPage from './Components/Register/RegisterPage';
import LoginPage from './Components/Login/LoginPage';
import DashboardPage from './Components/Dashboard/DashboardPage';
import ProfilePage from './Components/Profile/ProfilePage';
import AppointmentPage from './Components/Appointment/AppointmentPage';
import PrescriptionPage from './Components/Prescription/PrescriptionPage';
import TestResultPage from './Components/TestResult/TestResultPage';
import BPPage from './Components/BillingandPayment/BPPage';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/appointments" element={<AppointmentPage />} />
        <Route path="/dashboard/prescriptions" element={<PrescriptionPage />} />
        <Route path="/dashboard/testresults" element={<TestResultPage />} />
        <Route path="/dashboard/billing&payment" element={<BPPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
