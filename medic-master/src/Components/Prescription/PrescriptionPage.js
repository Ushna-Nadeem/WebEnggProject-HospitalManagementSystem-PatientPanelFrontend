import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrescriptionPage.css'

const PrescriptionComponent = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [isRefillFormOpen, setIsRefillFormOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const patientId = decodedToken?.patientId;

    if (patientId) {
      // Fetch active prescriptions using patientId
      fetchActivePrescriptions(patientId);
    } else {
      console.error('PatientId not found in the token.');
    }
  }, []);

  const fetchActivePrescriptions = async (patientId) => {
    const response = await fetch(`https://webbackend-production-d36d.up.railway.app/prescriptions/viewActive/${patientId}`);

    if (response.ok) {
      const data = await response.json();
      setPrescriptions(data);
    } else {
      console.error('Error fetching active prescriptions:', response.statusText);
    }
  };

  const handleRefillRequest = (prescription) => {
    setSelectedPrescription(prescription);
    setIsRefillFormOpen(true);
  };  

  const handleRefillFormClose = () => {
    setIsRefillFormOpen(false);
    // Clear the form input values
    setPharmacyName('');
    setPharmacyAddress('');
    setPharmacyPhone('');
  };

  const handleRefillFormSubmit = async () => {
    if (!selectedPrescription) {
      console.error('No prescription selected for refill');
      return;
    }
  
    try {
      const response = await fetch(`https://webbackend-production-d36d.up.railway.app/prescriptions/requestRefill/${selectedPrescription._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pharmacyName,
          pharmacyAddress,
          pharmacyPhone,
        }),
      });
  
      if (response.ok) {
        // Refill request successful, update the UI
        setPrescriptions(prevPrescriptions => {
          const updatedPrescriptions = [...prevPrescriptions];
          const updatedIndex = updatedPrescriptions.findIndex(p => p._id === selectedPrescription._id);
          
          if (updatedIndex !== -1) {
            updatedPrescriptions[updatedIndex] = {
              ...updatedPrescriptions[updatedIndex],
              refillsRemaining: updatedPrescriptions[updatedIndex].refillsRemaining - 1,
            };
          }
  
          return updatedPrescriptions;
        });
  
        // Close the form and clear the selected prescription and pharmacy details
        handleRefillFormClose();
      } else {
        console.error('Error requesting prescription refill:', response.statusText);
      }
    } catch (error) {
      console.error('Error requesting prescription refill:', error);
    }
  };    

  const handleBackToDashboard = () => {
    // Redirect to the dashboard
    navigate('/dashboard');
  };
  
  return (
    <div>
        {/* Navbar with Back to Dashboard button */}
        <nav className="profile-nav">
            <button className="profile-back-button" onClick={handleBackToDashboard}>
                Back to Dashboard
            </button>
        </nav>

        <div className="prescription-container">
            <h1 className='prescription-h1'>Active Prescriptions</h1>
            <ul className="prescription-list">
            {prescriptions.map((prescription) => (
            <li key={prescription._id} className="prescription-item">
            <div>
                <strong>{prescription.medicationName}</strong> - {prescription.dosage}
                <p>Instructions: {prescription.instructions}</p>
                <p>Prescription Date: {new Date(prescription.prescriptionDate).toLocaleDateString()}</p>
                <p>Expiration Date: {new Date(prescription.expirationDate).toLocaleDateString()}</p>
                <p>Doctor: {prescription.doctorName}</p>
                <p>Refills Remaining: {prescription.refillsRemaining}</p>
                <p>Pharmacy: {prescription.pharmacyName}</p>
                <p>Pharmacy Address: {prescription.pharmacyAddress}</p>
                <p>Pharmacy Phone: {prescription.pharmacyPhone}</p>
            </div>
            <div>
              <button onClick={() => handleRefillRequest(prescription)}>Request Refill</button>
            </div>
          </li>
        ))}
      </ul>

      {isRefillFormOpen && selectedPrescription && (
        <div className="overlay active">
            <div className="refill-form active">
                <h2>Refill Request</h2>
                <div>
                    <label>Pharmacy:</label>
                    <input type="text" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} />
                </div>
                <div>
                    <label>Pharmacy Address:</label>
                    <input type="text" value={pharmacyAddress} onChange={(e) => setPharmacyAddress(e.target.value)} />
                </div>
                <div>
                    <label>Pharmacy Phone:</label>
                    <input type="text" value={pharmacyPhone} onChange={(e) => setPharmacyPhone(e.target.value)} />
                </div>
                <button className='submit' onClick={handleRefillFormSubmit}>Submit Request</button>
                <button className='cancel' onClick={handleRefillFormClose}>Cancel</button>
            </div>
        </div>
      )}
        </div>
    </div>
  );
};

export default PrescriptionComponent;
