import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const Profile = () => {
  const [patientProfile, setPatientProfile] = useState({});
  const [medicalHistory, setMedicalHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modals
  const [updateProfileModal, setUpdateProfileModal] = useState(false);
  const [updateMedicalHistoryModal, setUpdateMedicalHistoryModal] = useState(false);

  const [updateProfileData, setUpdateProfileData] = useState({
    username:'',
    email:'',
    fullName: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    phoneNumber: '',
    address: '',
  });

  const [updateMedicalHistoryData, setUpdateMedicalHistoryData] = useState({
    allergies: '',
    medications: '',
    conditions: '',
    bloodtype: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      // Get Patient Profile
      fetch(`https://webbackend-production-d36d.up.railway.app/patients/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          setPatientProfile(data);
          setLoading(false);
        })
        .catch(error => console.error('Error fetching patient profile:', error));

      // Get Patient Medical History
      fetch(`https://webbackend-production-d36d.up.railway.app/patients/medical-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => setMedicalHistory(data))
        .catch(error => console.error('Error fetching medical history:', error));
    }
  }, []);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://webbackend-production-d36d.up.railway.app/patients/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateProfileData),
      });

      if (response.ok) {
        const updatedPatientProfile = await response.json();
        setPatientProfile(updatedPatientProfile);
        console.log('Profile updated successfully:', updatedPatientProfile);
        setUpdateProfileModal(false);
      } else {
        console.error('Error updating profile:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleUpdateMedicalHistory = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://webbackend-production-d36d.up.railway.app/patients/medical-history`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateMedicalHistoryData),
      });

      if (response.ok) {
        const updatedPatientMedicalHistory = await response.json();
        setMedicalHistory(updatedPatientMedicalHistory);
        console.log('Medical history updated successfully:', updatedPatientMedicalHistory);
        setUpdateMedicalHistoryModal(false);
      } else {
        console.error('Error updating medical history:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating medical history:', error);
    }
  };

  const handleDeleteProfile = async () => {
    const token = localStorage.getItem('token');

    // Display confirmation dialog
    const confirmation = window.confirm('Are you sure you want to delete your profile?');

    if (confirmation) {
      try {
        const response = await fetch(`https://webbackend-production-d36d.up.railway.app/patients/profile`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ confirmation: 'CONFIRM_DELETE' }),
        });

        if (response.ok) {
          const deletedProfileMessage = await response.json();
          console.log('Profile deleted successfully:', deletedProfileMessage);
          localStorage.removeItem('token'); // Remove token from local storage
          navigate('/'); // Redirect to homepage
        } else {
          console.error('Error deleting profile:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
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
      {/* Navbar with Delete Profile and Back to Dashboard buttons */}
      <nav className="profile-nav">
        <button className="profile-back-button" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
        <button className="profile-delete-button" onClick={handleDeleteProfile}>
          Delete Profile
        </button>
      </nav>
  
      {/* Main content */}
      <div className="profile-container">
        <div className="profile-info-container">
          <h1 className="profile-main-title">Profile</h1>
  
          {/* Personal Information */}
          <div className="profile-personal-info">
            <h2 className="profile-section-title">Personal Information</h2>
            <p>Username: {patientProfile.username}</p>
            <p>Email: {patientProfile.email}</p>
            <p>Full Name: {patientProfile.fullName}</p>
            <p>Age: {patientProfile.age}</p>
            <p>Weight: {patientProfile.weight}</p>
            <p>Height: {patientProfile.height}</p>
            <p>Gender: {patientProfile.gender}</p>
            <p>Phone Number: {patientProfile.phoneNumber}</p>
            <p>Address: {patientProfile.address}</p>
  
            {/* Update Profile Button */}
            <button className="profile-update-button" onClick={() => setUpdateProfileModal(true)}>
              Update Personal Information
            </button>
          </div>
  
          {/* Medical History */}
          <div className="profile-medical-info">
            <h2 className="profile-section-title">Medical History</h2>
            <p>Allergies: {medicalHistory.allergies}</p>
            <p>Medications: {medicalHistory.medications}</p>
            <p>Conditions: {medicalHistory.conditions}</p>
            <p>Blood Type: {medicalHistory.bloodtype}</p>
  
            {/* Update Medical History Button */}
            <button className="profile-update-button" onClick={() => setUpdateMedicalHistoryModal(true)}>
              Update Medical History
            </button>
          </div>
        </div>
      </div>
  
      {/* Update Profile Modal */}
      {updateProfileModal && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <span className="profile-close" onClick={() => setUpdateProfileModal(false)}>
              &times;
            </span>
            <h2 className="profile-update-title">Update Personal Information</h2>
            <form className="profile-form">
              <label className="profile-form-label">
                Username:
                <input
                  type="text"
                  value={updateProfileData.username}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, username: e.target.value })}
                  className="profile-input"
                />
              </label>
  
              <label className="profile-form-label">
                Email:
                <input
                  type="text"
                  value={updateProfileData.email}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, email: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Full Name:
                <input
                  type="text"
                  value={updateProfileData.fullName}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, fullName: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Age:
                <input
                  type="text"
                  value={updateProfileData.age}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, age: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Weight:
                <input
                  type="text"
                  value={updateProfileData.weight}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, weight: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Height:
                <input
                  type="text"
                  value={updateProfileData.height}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, height: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Gender:
                <input
                  type="text"
                  value={updateProfileData.gender}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, gender: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Phone Number:
                <input
                  type="text"
                  value={updateProfileData.phoneNumber}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, phoneNumber: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Address:
                <input
                  type="text"
                  value={updateProfileData.address}
                  onChange={(e) => setUpdateProfileData({ ...updateProfileData, address: e.target.value })}
                  className="profile-input"
                />
              </label>
              </form>
          <button className="profile-submit-button" onClick={handleUpdateProfile}>
            OK
          </button>
        </div>
      </div>
    )}

    {/* Update Medical History Modal */}
    {updateMedicalHistoryModal && (
      <div className="profile-modal">
        <div className="profile-modal-content">
          <span className="profile-close" onClick={() => setUpdateMedicalHistoryModal(false)}>
            &times;
          </span>
          <h2 className="profile-update-title">Update Medical History</h2>
          <form className="profile-form">
            <label className="profile-form-label">
              Allergies:
              <input
                type="text"
                value={updateMedicalHistoryData.allergies}
                onChange={(e) => setUpdateMedicalHistoryData({ ...updateMedicalHistoryData, allergies: e.target.value })}
                className="profile-input"
              />
            </label>

            <label className="profile-form-label">
              Medications:
              <input
                type="text"
                value={updateMedicalHistoryData.medications}
                onChange={(e) => setUpdateMedicalHistoryData({ ...updateMedicalHistoryData, medications: e.target.value })}
                className="profile-input"
              />
            </label>

              <label className="profile-form-label">
                Conditions:
                <input
                  type="text"
                  value={updateMedicalHistoryData.conditions}
                  onChange={(e) => setUpdateMedicalHistoryData({ ...updateMedicalHistoryData, conditions: e.target.value })}
                  className="profile-input"
                />
              </label>

              <label className="profile-form-label">
                Blood Type:
                <input
                  type="text"
                  value={updateMedicalHistoryData.bloodtype}
                  onChange={(e) => setUpdateMedicalHistoryData({ ...updateMedicalHistoryData, bloodtype: e.target.value })}
                  className="profile-input"
                />
              </label>
              </form>
          <button className="profile-submit-button" onClick={handleUpdateMedicalHistory}>
            OK
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default Profile;
