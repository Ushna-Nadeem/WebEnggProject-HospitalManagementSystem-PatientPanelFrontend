import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TestResultPage.css';

const TestResults = () => {
  // State variables
  const [allTestResults, setAllTestResults] = useState([]); // Store all test results
  const [testResults, setTestResults] = useState([]); // Use this for display and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch test results when the component mounts
    const token = localStorage.getItem('token');
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const patientId = decodedToken?.patientId;

    if (patientId) {
      // Fetch test results using patientId
      fetchTestResults(patientId);
    } else {
      console.error('PatientId not found in the token.');
    }
  }, []);

  // Function to fetch test results for a specific patient
  const fetchTestResults = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:3000/testresults/viewTestResults/${patientId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch test results: ${response.statusText}`);
      }

      const data = await response.json();
      setAllTestResults(data);
      setTestResults(data); // Initialize both state variables with the data
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  // Function to handle search based on test or lab name
  const handleSearch = () => {
    // Reset selectedTest to null when searching
    setSelectedTest(null);

    // Filter test results based on the searchTerm
    const filteredResults = allTestResults.filter(
      (result) =>
        result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.labName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setTestResults(filteredResults);
  };

  // Function to handle click on a specific test
  const handleTestClick = (test) => {
    // Set the selectedTest for displaying detailed information
    setSelectedTest(test);
  };

  // Function to handle "Show All" button click
  const handleShowAll = () => {
    setTestResults(allTestResults);
  };

  const handleBackToDashboard = () => {
    // Redirect to the dashboard
    navigate('/dashboard');
  };

  // JSX rendering
  return (
    <div>
        {/* Navbar with Back to Dashboard button */}
      <nav className="profile-nav">
        <button className="profile-back-button" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </nav>

      <div className="test-results-container">
      <h1 className='testresult-h1'>Test Results</h1>
      {/* Search input and button */}
      <div>
        <input className='testresult-input'
          type="text"
          placeholder="Test name/Lab name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className='testresult-search' onClick={handleSearch}>Search</button>
        <button className='testresult-all' onClick={handleShowAll}>Show All Results</button>
      </div>
      {/* List of test results */}
      <div className="test-results-list">
        {testResults.map((result) => (
          <li key={result._id} className="test-result-item" onClick={() => handleTestClick(result)}>
            <div>
              <strong>{result.testName}</strong>
            </div>
          </li>
        ))}
      </div>
      {/* Display detailed information of the selected test */}
      {selectedTest && (
        <div className="selected-test-details">
          <h3>{selectedTest.testName}</h3>
          <p>Result: {selectedTest.result}</p>
          <p>Test Date: {new Date(selectedTest.testDate).toLocaleDateString()}</p>
          <p>Lab Name: {selectedTest.labName}</p>
          <p>Lab Address: {selectedTest.labAddress}</p>
          <p>Lab Phone: {selectedTest.labPhone}</p>
          <p>Doctor: {selectedTest.doctorName}</p>
          <p>Comments: {selectedTest.comments}</p>
        </div>
      )}
    </div>
    </div>
  );
};

export default TestResults;
