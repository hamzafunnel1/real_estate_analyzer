import React from 'react';

const TestCardInfo = () => {
  return (
    <div className="card mb-6">
      <h3 className="text-xl font-bold theme-text-primary mb-4 text-center">
        Test Mode
      </h3>
      <div className="space-y-4">
        <div className="p-4 theme-bg-secondary rounded-lg border-2 border-green-500">
          <h4 className="font-bold theme-text-primary text-lg">Test Card Number</h4>
          <p className="text-3xl font-mono theme-text-primary tracking-wider">4242 4242 4242 4242</p>
          <div className="mt-3 space-y-1">
            <p className="theme-text-secondary"><span className="font-medium">Expiry:</span> Any future date (e.g., 12/25)</p>
            <p className="theme-text-secondary"><span className="font-medium">CVC:</span> Any 3 digits (e.g., 123)</p>
          </div>
        </div>
        <div className="text-center p-3 theme-bg-tertiary rounded-lg">
          <p className="text-sm theme-text-secondary">
            💡 This is a test environment. Use the card above for testing payments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestCardInfo; 