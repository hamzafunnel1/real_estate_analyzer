import React from 'react';
import { Info, Copy } from 'lucide-react';

const DemoCredentials = () => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = 'Copied to clipboard!';
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Login Credentials</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between bg-white p-2 rounded border">
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-mono text-blue-800">demo@example.com</span>
              </div>
              <button
                onClick={() => copyToClipboard('demo@example.com')}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Copy email"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between bg-white p-2 rounded border">
              <div>
                <span className="text-gray-600">Password:</span>
                <span className="ml-2 font-mono text-blue-800">password</span>
              </div>
              <button
                onClick={() => copyToClipboard('password')}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Copy password"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Use these credentials to test the application. In production, you would use your own authentication system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoCredentials; 