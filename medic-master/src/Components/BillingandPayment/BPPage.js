import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BPPage.css';

const BillingPage = () => {
  const [bills, setBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [outstandingBills, setOutstandingBills] = useState([]);
  const [viewOutstanding, setViewOutstanding] = useState(false);
  const [viewPaid, setViewPaid] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [cardInfo, setCardInfo] = useState({
    cardLast4: '',
    cardBrand: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
  });
  const [paymentModalData, setPaymentModalData] = useState({
    showPaymentModal: false,
    selectedBillId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const patientId = decodedToken?.patientId;

    if (patientId) {
      fetchAllBills(patientId);
      fetchPaidBills(patientId);
      fetchOutstandingBills(patientId);
    } else {
      console.error('PatientId not found in the token.');
    }
  }, []);

  const fetchAllBills = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:3000/bills/${patientId}`);
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching all bills:', error);
    }
  };

  const fetchPaidBills = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:3000/bills/paid/${patientId}`);
      setPaidBills(response.data);
    } catch (error) {
      console.error('Error fetching paid bills:', error);
    }
  };

  const fetchOutstandingBills = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:3000/bills/outstanding/${patientId}`);
      setOutstandingBills(response.data);
    } catch (error) {
      console.error('Error fetching outstanding bills:', error);
    }
  };

  // Add a Stripe public key
  const stripePublicKey = "pk_test_51OR7uiJNnFca1N2NIsFO6mQjqiQl9LWOY5aWm6UKmT7lpVZn3pJ6DhgXntw80o3KfMddgXhIxa42UBC5lDEfrTHo00EnLDDlnT";

  // Load Stripe outside the component to avoid recreating the instance on every render
  const stripePromise = loadStripe(stripePublicKey);

  const renderBillingInfo = (billingArray) => {
    return (
      <ul className="billing-list">
        {billingArray.map((billing) => (
          <li key={billing._id} className="billing-item">
            <strong className="billing-description">Description:</strong> {billing.description} |
            <strong className="billing-amount">Amount:</strong> ${billing.amount} |
            <strong className="billing-date">Date:</strong> {new Date(billing.date).toLocaleDateString()} |
            <strong className="billing-paid">Paid:</strong> {billing.isPaid ? 'Yes' : 'No'} |
            <strong className="billing-payment-type">Payment Type:</strong> {billing.paymentType}
            {billing.paymentType === 'Card' && (
              <>
                <br />
                <strong className="billing-card-last4">Card Last 4:</strong> {billing.cardPaymentInfo?.cardLast4} |
                <strong className="billing-card-brand">Card Brand:</strong> {billing.cardPaymentInfo?.cardBrand} |
                <strong className="billing-card-expiry">Card Expiry:</strong>{' '}
                {billing.cardPaymentInfo?.cardExpiryMonth}/{billing.cardPaymentInfo?.cardExpiryYear}
              </>
            )}
            {!billing.isPaid && (
            <>
              <button onClick={() => handlePayWithStripe(billing._id)}>Pay via Stripe</button>
              <button onClick={() => handlePayWithCard(billing._id)}>Pay via Card</button>
            </>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const handleViewOutstanding = () => {
    setViewOutstanding(true);
    setViewPaid(false);
  };

  const handleViewPaid = () => {
    setViewOutstanding(false);
    setViewPaid(true);
  };

  const handleShowAll = () => {
    setViewOutstanding(false);
    setViewPaid(false);
  };

  const handlePayWithCard = (billId) => {
    setSelectedBills([billId]);
    setCardInfo({
      cardLast4: '',
      cardBrand: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
    });
  
    // Set the specific bill for which the Card payment modal should be shown
    setPaymentModalData({
      showPaymentModal: true,
      selectedBillId: billId,
      paymentMethod: 'card',
    });
  };

  const handleCardPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.patientId;
  
      const response = await axios.put(`http://localhost:3000/bills/payment/card/${patientId}`, {
        billIds: selectedBills,
        ...cardInfo,
      });
  
      console.log(response.data);
  
      // Fetch updated bills after payment
      fetchAllBills(patientId);
  
      // Fetch updated paid and outstanding bills
      fetchPaidBills(patientId);
      fetchOutstandingBills(patientId);
  
      // Hide the payment modal after successful payment
      setPaymentModalData({
        showPaymentModal: false,
        selectedBillId: null,
      });
  
      // Show the payment success message
      setPaymentSuccess(true);
  
      // Hide the payment success message after a few seconds (adjust as needed)
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error making card payment:', error);
    }
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prevCardInfo) => ({
      ...prevCardInfo,
      [name]: value,
    }));
  };

  const handleStripePayment = async (stripe, elements) => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.patientId;
  
      // Ensure patientId is defined
      if (!patientId) {
        console.error('PatientId not found in the token.');
        return;
      }
  
      // Get a reference to a mounted CardElement
      const cardElement = elements.getElement(CardElement);
  
      // Create a PaymentMethod using the card information
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
  
      if (error) {
        console.error('Error creating PaymentMethod:', error);
        // Handle error (show error message, etc.)
      } else {
        // Make a request to your backend to complete the payment using the PaymentMethod
        const response = await axios.put(`http://localhost:3000/bills/payment/stripe/${patientId}`, {
          billIds: selectedBills,
          paymentMethodId: paymentMethod.id,
        });
  
        console.log(response.data);

        // Fetch updated bills after payment
        fetchAllBills(patientId);
  
        // Fetch updated paid and outstanding bills
        fetchPaidBills(patientId);
        fetchOutstandingBills(patientId);
  
        // Hide the payment modal after successful payment
        setPaymentModalData({
          showPaymentModal: false,
          selectedBillId: null,
        });
  
        // Reset cardInfo state
        setCardInfo({
          cardLast4: '',
          cardBrand: '',
          cardExpiryMonth: '',
          cardExpiryYear: '',
        });
  
        // Show the payment success message
        setPaymentSuccess(true);
  
        // Hide the payment success message after a few seconds (adjust as needed)
        setTimeout(() => {
          setPaymentSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error making Stripe payment:', error);
    }
  };

  const handlePayWithStripe = (billId) => {
    setSelectedBills([billId]);
    setCardInfo({
      cardLast4: '',
      cardBrand: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
    });
  
    // Set the specific bill for which the Stripe payment modal should be shown
    setPaymentModalData({
      showPaymentModal: true,
      selectedBillId: billId,
      paymentMethod: 'stripe',
    });
  };

  const closePaymentModal = () => {
    setPaymentModalData({
      showPaymentModal: false,
      selectedBillId: null,
    });
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
    <div className="billing-container">
      <h2 className="billing-title">Bills</h2>
      <button className="billing-btn" onClick={handleViewOutstanding}>View Outstanding Bills</button>
      <button className="billing-btn" onClick={handleViewPaid}>View Paid Bills</button>
      <button className="billing-btn" onClick={handleShowAll}>Show All Bills</button>

      {viewOutstanding && (
        <>
          <h3 className="billing-subtitle">Outstanding Bills</h3>
          {renderBillingInfo(outstandingBills)}

          {/* Payment Modal */}
          {paymentModalData.showPaymentModal && viewOutstanding && paymentModalData.paymentMethod === 'card' && (
            <div className="billing-payment-modal">
              <div className="billing-payment-modal-content">
                <span className="billing-payment-modal-close" onClick={closePaymentModal}>
                  &times;
                </span>
                <h1>Payment via Card</h1>
                <h2>Enter Card Details</h2>
                <label>Card Last 4:</label>
                <input
                  type="text"
                  name="cardLast4"
                  value={cardInfo.cardLast4}
                  onChange={handleCardInfoChange}
                />
                <label>Card Brand:</label>
                <input
                  type="text"
                  name="cardBrand"
                  value={cardInfo.cardBrand}
                  onChange={handleCardInfoChange}
                />
                <label>Card Expiry Month:</label>
                <input
                  type="text"
                  name="cardExpiryMonth"
                  value={cardInfo.cardExpiryMonth}
                  onChange={handleCardInfoChange}
                />
                <label>Card Expiry Year:</label>
                <input
                  type="text"
                  name="cardExpiryYear"
                  value={cardInfo.cardExpiryYear}
                  onChange={handleCardInfoChange}
                />
                <button onClick={handleCardPayment}>Pay</button>
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {paymentModalData.showPaymentModal && viewOutstanding && paymentModalData.paymentMethod === 'stripe' && (
            <div className="billing-payment-modal">
              <div className="billing-payment-modal-content">
                <span className="billing-payment-modal-close" onClick={closePaymentModal}>
                  &times;
                </span>
                <h1>Pay via Stripe</h1>
                <h2>Enter Stripe Details</h2>
                {/* Use Elements to wrap the payment form */}
                <Elements stripe={stripePromise}>
                  {/* Pass handleStripePayment function to PaymentForm */}
                  <PaymentForm handleStripePayment={handleStripePayment} />
                </Elements>
              </div>
            </div>
          )}
        </>
      )}

      {viewPaid && (
        <>
          <h3 className="billing-subtitle">Paid Bills</h3>
          {renderBillingInfo(paidBills)}
        </>
      )}

      {!viewOutstanding && !viewPaid && (
        <>
          <h3 className="billing-subtitle">All Bills</h3>
          {renderBillingInfo(bills)}
        </>
      )}

      {/* Payment success message */}
      {paymentSuccess && (
        <div className="billing-payment-success-message">
          Payment Successful! Thank you for your payment.
        </div>
      )}
    </div>
    </div>
  );
};

// Define a new component for the payment form using Elements
const PaymentForm = ({ handleStripePayment }) => {
  const stripe = useStripe();
  const elements = useElements();

  // Handle the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Call the handleStripePayment function with stripe and elements objects
    await handleStripePayment(stripe, elements);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay</button>
    </form>
  );
};

// Export the BillingPage component as the default export
export default BillingPage;
