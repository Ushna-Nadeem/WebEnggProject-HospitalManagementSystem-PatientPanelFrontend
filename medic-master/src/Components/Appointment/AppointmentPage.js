import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentPage.css';

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();

  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: '',
    specialty: '',
    preferredDate: '',
    preferredTime: '',
    appointmentType: '',
    reason: '',
    hasInsurance: false,
    emergencyContact: {
      name: '',
      number: '',
    },
  });

  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const showAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const patientId = decodedToken?.patientId;

    if (patientId) {
      // Fetch appointments and history using patientId
      fetchAppointments(patientId);
      fetchAppointmentHistory(patientId);
    } else {
      console.error('PatientId not found in the token.');
      setLoading(false);
    }
  }, []);

  const fetchAppointments = async (patientId) => {
    try {
      const response = await fetch(`https://webbackend-production-d36d.up.railway.app/appointments/view/${patientId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const appointmentsData = await response.json();
        setAppointments(appointmentsData);
        setLoading(false);
      } else {
        console.error('Error fetching appointments:', response.statusText);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const fetchAppointmentHistory = async (patientId) => {
    try {
      const response = await fetch(`https://webbackend-production-d36d.up.railway.app/appointments/viewhistory/${patientId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const historyData = await response.json();
        setAppointmentHistory(historyData);
      } else {
        console.error('Error fetching appointment history:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching appointment history:', error);
    }
  };

  const submitAppointmentForm = async () => {
    try {
      // Get patientId from the authentication token
      const token = localStorage.getItem('token');
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.patientId;

      if (!patientId) {
        console.error('PatientId not found in the token.');
        return;
      }

      // Logic to book an appointment
      const response = await fetch('https://webbackend-production-d36d.up.railway.app/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          patientId: patientId, // Dynamically obtained patientId
          ...appointmentForm,
        }),
      });

      if (response.ok) {
        // Fetch and display the newly booked appointment
        fetchAppointments(patientId);
        console.log('Appointment booked successfully.');
        // Close the modal after successful booking
        closeModal();
      } else {
        console.error('Error booking appointment:', response.statusText);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      // Confirm cancellation with a dialog
      const shouldCancel = window.confirm('Are you sure you want to cancel this appointment?');

      if (!shouldCancel) {
        return; // Do nothing if the user cancels the confirmation
      }

      // Logic to cancel an appointment
      const response = await fetch(`https://webbackend-production-d36d.up.railway.app/appointments/cancel/${appointmentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Update the local state immediately
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === appointmentId ? { ...appointment, status: 'Cancelled' } : appointment
          )
        );
        console.log('Appointment cancelled successfully.');
      } else {
        console.error('Error cancelling appointment:', response.statusText);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleBackToDashboard = () => {
    // Redirect to the dashboard
    navigate('/dashboard');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Navbar with Back to Dashboard button */}
      <nav className="profile-nav">
        <button className="profile-back-button" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </nav>

      <h1 className="page-title">My Appointments</h1>
      <button onClick={openModal} className="appointment-schedule-btn">
        Schedule Appointment
      </button>

      {/* Custom modal for booking appointment */}
      {isModalOpen && (
        <div className="appointment-modal">
          <div className="appointment-modal-content">
            <span className="appointment-modal-close" onClick={closeModal}>
              &times;
            </span>
            <h2>Schedule Appointment</h2>
            <form>
              <label>
                Doctor Name:
                <input
                  type="text"
                  value={appointmentForm.doctorName}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
                />
              </label>

              <label>
                Specialty:
                <input
                  type="text"
                  value={appointmentForm.specialty}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, specialty: e.target.value })}
                />
              </label>

              <label>
                Date:
                <input
                  type="date"
                  value={appointmentForm.preferredDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredDate: e.target.value })}
                />
              </label>

              <label>
                Time:
                <input
                  type="time"
                  value={appointmentForm.preferredTime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredTime: e.target.value })}
                />
              </label>

              <label>
                Appointment Type:
                <select
                  value={appointmentForm.appointmentType}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentType: e.target.value })}
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </label>

              <label>
                Reason:
                <textarea
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                />
              </label>

              <label>
                Insurance:
                <input
                  type="checkbox"
                  checked={appointmentForm.hasInsurance}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, hasInsurance: e.target.checked })}
                />
              </label>

              <label>
                Emergency Contact Name:
                <input
                  type="text"
                  value={appointmentForm.emergencyContact.name}
                  onChange={(e) => setAppointmentForm({
                    ...appointmentForm,
                    emergencyContact: { ...appointmentForm.emergencyContact, name: e.target.value }
                  })}
                />
              </label>

              <label>
                Emergency Contact Number:
                <input
                  type="text"
                  value={appointmentForm.emergencyContact.number}
                  onChange={(e) => setAppointmentForm({
                    ...appointmentForm,
                    emergencyContact: { ...appointmentForm.emergencyContact, number: e.target.value }
                  })}
                />
              </label>

              <button type="button" onClick={submitAppointmentForm} className="appointment-btn">Schedule</button>
            </form>
          </div>
        </div>
      )}

      {selectedAppointment && (
        // Detailed view of the selected appointment
        <div className="appointment-modal">
          <div className="appointment-modal-content">
            <span className="appointment-modal-close" onClick={closeAppointmentDetails}>
              &times;
            </span>
            <h2>Appointment Details</h2>
            <p>
              <strong>Doctor Name:</strong> {selectedAppointment.doctorName}
            </p>
            <p><strong>Specialty:</strong> {selectedAppointment.specialty}</p>
            <p><strong>Date:</strong> {selectedAppointment.preferredDate}</p>
            <p><strong>Time:</strong> {selectedAppointment.preferredTime}</p>
            <p><strong>Appointment Type:</strong> {selectedAppointment.appointmentType}</p>
            <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
            <p><strong>Insurance:</strong> {selectedAppointment.hasInsurance ? 'Yes' : 'No'}</p>
            <p><strong>Emergency Contact Name:</strong> {selectedAppointment.emergencyContact.name}</p>
            <p><strong>Emergency Contact Number:</strong> {selectedAppointment.emergencyContact.number}</p>
          </div>
        </div>
      )}

      {appointments.length === 0 ? (
        <p>No upcoming scheduled appointments found.</p>
      ) : (
        <ul className="appointment-list">
          {appointments.map((appointment) => (
            <li className="appointment-item" key={appointment._id}>
              <div className="appointment-details">
                <span className="maroon-line"></span>
                <strong>{appointment.doctorName}</strong> - {appointment.preferredDate} {appointment.preferredTime}
                <span className="maroon-line"></span>
              </div>
              <div className="appointment-buttons">
                {appointment.status === 'Scheduled' ? (
                  <>
                    <button onClick={() => cancelAppointment(appointment._id)} className="appointment-btn-cancel">Cancel Appointment</button>
                    <button onClick={() => showAppointmentDetails(appointment)} className="appointment-btn-details">View Appointment Details</button>
                  </>
                ) : (
                  <span>Appointment {appointment.status}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {appointmentHistory.length === 0 ? (
        <p>No appointment history found.</p>
      ) : (
        <div>
          <h1 className="page-title">Appointment History</h1>
          <ul className="appointment-list">
            {appointmentHistory.map((appointment) => (
              <li className="appointment-item" key={appointment._id}>
                <div className="appointment-details">
                  <span className="maroon-line"></span>
                  <strong>{appointment.doctorName}</strong> - {appointment.preferredDate} {appointment.preferredTime}
                  <span className="maroon-line"></span>
                </div>
                <div className="appointment-buttons">
                  {appointment.status === 'Cancelled' ? (
                    <span>Appointment {appointment.status}
                    <button onClick={() => showAppointmentDetails(appointment)} className="appointment-btn-details">View Appointment Details</button>
                    </span>
                  ) : (
                    <>
                      <span>Appointment {appointment.status}
                      <button onClick={() => showAppointmentDetails(appointment)} className="appointment-btn-details">View Appointment Details</button>
                      </span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Appointment;
