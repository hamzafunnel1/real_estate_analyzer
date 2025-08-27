import React, { useState, useEffect } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTheme } from '../contexts/ThemeContext';

const SeparateCardInputs = ({ onCardChange, onValidationChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { isLight } = useTheme();
  const [errors, setErrors] = useState({});
  const [isComplete, setIsComplete] = useState({
    cardNumber: false,
    expiry: false,
    cvc: false
  });

  // Card element options with theme support
  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: isLight ? '#1f2937' : '#ffffff',
        fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: isLight ? '#6b7280' : '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  const handleCardNumberChange = (event) => {
    setErrors(prev => ({ ...prev, cardNumber: event.error?.message || '' }));
    setIsComplete(prev => ({ ...prev, cardNumber: event.complete }));
    onCardChange && onCardChange('cardNumber', event);
  };

  const handleExpiryChange = (event) => {
    setErrors(prev => ({ ...prev, expiry: event.error?.message || '' }));
    setIsComplete(prev => ({ ...prev, expiry: event.complete }));
    onCardChange && onCardChange('expiry', event);
  };

  const handleCvcChange = (event) => {
    setErrors(prev => ({ ...prev, cvc: event.error?.message || '' }));
    setIsComplete(prev => ({ ...prev, cvc: event.complete }));
    onCardChange && onCardChange('cvc', event);
  };

  // Check if all fields are complete
  useEffect(() => {
    const allComplete = isComplete.cardNumber && isComplete.expiry && isComplete.cvc;
    const hasErrors = Object.values(errors).some(error => error);
    onValidationChange && onValidationChange(allComplete && !hasErrors);
  }, [isComplete, errors, onValidationChange]);

  return (
    <div className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">
          Card Number
        </label>
        <div className={`theme-bg-tertiary theme-border-secondary border rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
          errors.cardNumber ? 'border-red-500 ring-red-500' : ''
        }`}>
          <CardNumberElement 
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardNumberChange}
          />
        </div>
        {errors.cardNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry and CVC Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Expiry Date
          </label>
          <div className={`theme-bg-tertiary theme-border-secondary border rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
            errors.expiry ? 'border-red-500 ring-red-500' : ''
          }`}>
            <CardExpiryElement 
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleExpiryChange}
            />
          </div>
          {errors.expiry && (
            <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            CVC
          </label>
          <div className={`theme-bg-tertiary theme-border-secondary border rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
            errors.cvc ? 'border-red-500 ring-red-500' : ''
          }`}>
            <CardCvcElement 
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCvcChange}
            />
          </div>
          {errors.cvc && (
            <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeparateCardInputs; 