import React, { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import TestCardInfo from './TestCardInfo';
import SeparateCardInputs from './SeparateCardInputs';

const StripeCheckout = ({ package: pkg, address, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { isLight } = useTheme();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showAdBlockerHelp, setShowAdBlockerHelp] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    postalCode: '',
  });
  const [cardValidation, setCardValidation] = useState(false);



  // Check if Stripe is blocked on component mount
  useEffect(() => {
    if (!stripe) {
      const timer = setTimeout(() => {
        setShowAdBlockerHelp(true);
      }, 3000); // Show ad blocker help after 3 seconds if Stripe hasn't loaded
      
      return () => clearTimeout(timer);
    }
  }, [stripe]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system is not available. Please disable ad blockers and refresh the page.');
      return;
    }

    setProcessing(true);
    setError(null);

    const cardNumberElement = elements.getElement('cardNumber');
    const cardExpiryElement = elements.getElement('cardExpiry');
    const cardCvcElement = elements.getElement('cardCvc');

    try {
      // Create payment intent on backend
      const { api } = await import('../utils/api');
      const paymentIntentResponse = await api.createPaymentIntent({
        amount: pkg.price * 100, // Convert to cents
        currency: 'usd',
        package_id: pkg.id,
        package_name: pkg.name,
        address: address,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
      });

      const { client_secret } = paymentIntentResponse;

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: {
              postal_code: customerInfo.postalCode,
            },
          },
        },
      });

      if (result.error) {
        if (result.error.type === 'card_error' || result.error.type === 'validation_error') {
          setError(result.error.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        setProcessing(false);
      } else {
        // Payment succeeded
        onSuccess({
          paymentIntent: result.paymentIntent,
          package: pkg,
          customerInfo,
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      
      // Check if it's likely an ad blocker issue
      if (err.message.includes('Failed to fetch') || err.message.includes('blocked')) {
        setError('Payment blocked by ad blocker. Please disable ad blockers for this site and try again.');
        setShowAdBlockerHelp(true);
      } else {
        setError(err.message || 'An error occurred while processing payment');
      }
      setProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  // Show ad blocker help if Stripe is not loading
  if (showAdBlockerHelp && !stripe) {
    return (
      <div className="max-w-md mx-auto card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold theme-text-primary mb-2">Payment System Blocked</h2>
          <p className="theme-text-secondary">
            It looks like your ad blocker is preventing the payment system from loading.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">To proceed with payment:</h3>
            <ol className="text-sm text-amber-700 space-y-1">
              <li>1. Disable your ad blocker for this site</li>
              <li>2. Refresh the page</li>
              <li>3. Try payment again</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Common ad blockers:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• AdBlock Plus</li>
              <li>• uBlock Origin</li>
              <li>• AdGuard</li>
              <li>• Ghostery</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex-1 btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto card">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold theme-text-primary mb-2">Complete Payment</h2>
        <p className="theme-text-secondary">
          {pkg.name} Package - ${pkg.price}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Card Information */}
        <TestCardInfo />
        
        {/* Customer Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium theme-text-primary mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium theme-text-primary mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium theme-text-primary mb-2">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            value={customerInfo.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="input-field"
            placeholder="12345"
            required
          />
        </div>

        {/* Card Information */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Card Information
          </label>
          <SeparateCardInputs 
            onValidationChange={setCardValidation}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Payment Error</p>
              <p className="text-sm text-red-600">{error}</p>
              {error.includes('ad blocker') && (
                <button
                  type="button"
                  onClick={() => setShowAdBlockerHelp(true)}
                  className="text-sm text-red-600 underline mt-1"
                >
                  Show help
                </button>
              )}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="theme-bg-secondary theme-border-primary border rounded-lg p-4 flex items-center space-x-3">
          <Lock className="w-5 h-5 theme-text-muted" />
          <p className="text-sm theme-text-secondary">
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn-secondary"
            disabled={processing}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!stripe || processing || !customerInfo.name || !customerInfo.email || !customerInfo.postalCode || !cardValidation}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <span>Pay ${pkg.price}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripeCheckout; 