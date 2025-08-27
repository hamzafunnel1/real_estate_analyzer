import React, { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight, Shield, Phone, Clock, CheckCircle, MapPin, FileText, CreditCard, Lock } from 'lucide-react';
import StripeCheckout from '../components/StripeCheckout';
import { motion } from 'framer-motion';

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    priceType: 'one-time',
    icon: Shield,
    description: 'Perfect for occasional listings',
    features: [
      '1 custom listing presentation',
      'Delivered in minutes',
      'Branded Notion web page (shareable, mobile-friendly)',
      'Email + SMS delivery',
      'Perfect for occasional listings'
    ],
    color: 'from-gray-500 to-gray-600',
    popular: false,
    buttonText: 'Get Started'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    priceType: 'month',
    icon: Star,
    description: 'Ideal for active agents',
    features: [
      'Up to 5 custom presentations/month',
      'Delivered in minutes',
      'Reusable branding + agent profile',
      'Analytics dashboard (views, clicks)',
      'Priority support',
      'Ideal for active agents'
    ],
    color: 'from-blue-500 to-purple-600',
    popular: true,
    buttonText: 'Try Now'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 649,
    priceType: 'month',
    icon: Crown,
    description: 'Built for high-performing agents',
    features: [
      'Up to 15 custom presentations/month',
      'Delivered in minutes',
      'Custom templates',
      'Dedicated Listing Success Manager',
      'Built for high-performing agents'
    ],
    color: 'from-purple-600 to-pink-600',
    popular: false,
    buttonText: 'Upgrade Now'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    priceType: 'custom',
    icon: Phone,
    description: 'For brokerages and teams',
    features: [
      '20+ Listings Per Year?',
      'White-label + full integrations',
      'Custom templates + advanced analytics',
      'Live support + team training',
      'For brokerages and teams'
    ],
    color: 'from-gray-800 to-gray-900',
    popular: false,
    buttonText: 'Schedule Demo'
  }
];

const PackageSelection = ({ onSelect, onPerplexityResult, onBack, address }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState({ name: '', email: '' });

  const handleSelect = async (pkg) => {
    // Handle Enterprise package differently - just book a call
    if (pkg.id === 'enterprise') {
      // In a real app, this would open a calendar booking widget
      alert('Enterprise package selected! Please contact sales for a custom demo.');
      return;
    }

    // Show Stripe checkout for paid packages
    setSelectedPackage(pkg);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setIsProcessing(true);
    setShowCheckout(false);
    
    try {
      // After payment is processed, call Perplexity API
      if (address && onPerplexityResult) {
        // Call real Perplexity API
        const { api } = await import('../utils/api');
        const data = await api.perplexityAnalyze(address);
        
        // Save the analysis to the database if user is logged in
        const token = localStorage.getItem('token');
        if (token && data.choices && data.choices[0]?.message?.content) {
          try {
            await api.savePropertyAnalysis({
              address: address,
              package_name: selectedPackage.name,
              analysis_content: data.choices[0].message.content,
              analysis_model: data.model || 'sonar',
              api_response: data,
              agent_description: data.agent_description || '',
              payment_intent_id: paymentResult.paymentIntent.id,
            });
            console.log('Property analysis saved successfully');
            
            // Small delay to ensure the analysis is saved before showing result
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (saveError) {
            console.error('Error saving property analysis:', saveError);
            // Continue with the flow even if save fails
          }
        }
        
        onPerplexityResult(address, data);
      } else {
        // If no address or onPerplexityResult, just proceed with normal flow
        onSelect(selectedPackage);
      }
    } catch (error) {
      console.error('Error processing payment or calling Perplexity:', error);
      // Still proceed with the normal flow even if Perplexity fails
      onSelect(selectedPackage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setShowCheckout(false);
    setSelectedPackage(null);
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setSelectedPackage(null);
  };

  // Show checkout if a package is selected
  if (showCheckout && selectedPackage) {
    return (
      <div className="min-h-screen theme-bg-primary py-12 px-4 flex items-center justify-center">
        <StripeCheckout
          package={selectedPackage}
          address={address}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  // Show processing state
  if (isProcessing) {
    return (
      <div className="min-h-screen theme-bg-primary flex items-center justify-center">
        <div className="card text-center max-w-lg mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold theme-text-primary mb-4">Processing Your Order</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-center theme-text-secondary">
              <div className="w-5 h-5 text-green-400 mr-3">✓</div>
              <span>Payment confirmed successfully</span>
            </div>
            <div className="flex items-center theme-text-secondary">
              <div className="w-5 h-5 text-green-400 mr-3">✓</div>
              <span>Analyzing property data...</span>
            </div>
            <div className="flex items-center theme-text-secondary">
              <div className="w-5 h-5 text-blue-400 mr-3 animate-pulse">⚡</div>
              <span>Generating AI content...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary">
      <div className="container-section">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black theme-text-primary mb-6 leading-tight">
            Choose Your <span className="text-gradient">Winning</span> Package
          </h1>
          <p className="text-xl theme-text-secondary mb-8 leading-relaxed max-w-3xl mx-auto">
            Professional property presentations designed to help you 
            <span className="text-accent font-bold"> win more listings</span> and 
            <span className="text-accent font-bold"> close deals faster</span>
          </p>
          
          {/* Property Address Display */}
          <div className="inline-flex items-center theme-bg-tertiary rounded-2xl px-8 py-4 theme-border-primary border">
            <MapPin className="w-6 h-6 text-blue-400 mr-3" />
            <span className="text-lg font-bold theme-text-primary">{address}</span>
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {packages.map((pkg) => (
            <motion.div
                key={pkg.id}
              className={`card-feature cursor-pointer transition-all duration-300 relative overflow-hidden ${
                pkg.popular ? 'border-green-500/50' : ''
              }`}
              onClick={() => handleSelect(pkg)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Most Popular Badge */}
                {pkg.popular && (
                <div className="absolute top-0 right-0 text-white px-4 py-1 text-xs font-bold rounded-bl-xl" style={{background: 'linear-gradient(90deg, #00C4FF 0%, #0066CC 100%)'}}>
                      Most Popular
                    </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  pkg.id === 'starter' ? 'bg-blue-500/20' :
                  pkg.id === 'pro' ? 'bg-green-500/20' :
                  pkg.id === 'elite' ? 'bg-purple-500/20' :
                  'bg-gray-500/20'
                }`}>
                  <pkg.icon className={`w-6 h-6 ${
                    pkg.id === 'starter' ? 'text-blue-400' :
                    pkg.id === 'pro' ? 'text-green-400' :
                    pkg.id === 'elite' ? 'text-purple-400' :
                    'theme-text-muted'
                  }`} />
                </div>
                
                <h3 className="text-xl font-black theme-text-primary mb-2">{pkg.name}</h3>
                <div className="text-3xl font-black theme-text-primary mb-1">
                  {pkg.price ? `$${pkg.price}` : 'Custom'}
                </div>
                <p className="theme-text-muted text-sm font-medium">
                  {pkg.priceType === 'one-time' ? 'One-time' : 
                   pkg.priceType === 'month' ? 'Per month' : 
                   'Contact us'}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-2.5 h-2.5 text-green-400" />
                    </div>
                    <span className="theme-text-secondary text-sm font-medium leading-relaxed">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <button className="w-full py-3 px-4 font-bold text-sm transition-all duration-300 transform hover:scale-105 text-white shadow-lg" style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)', borderRadius: '10px'}} onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0052A3 0%, #00A3D6 100%)'} onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}>
                {pkg.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-4">Complete Your Order</h2>
                <div className="inline-flex items-center bg-gray-800 rounded-xl px-6 py-3">
                  <span className="text-lg text-gray-300 mr-4">Selected Package:</span>
                  <span className="text-xl font-bold text-white">{selectedPackage.name}</span>
                  <span className="text-2xl font-black text-green-400 ml-4">${selectedPackage.price}</span>
                </div>
                  </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Billing Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Billing Information</h3>
                    
                    <div>
                      <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={billingInfo.name}
                        onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                        className="input-field"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={billingInfo.email}
                        onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                        className="input-field"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Payment Method</h3>
                    
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <CreditCard className="w-6 h-6 text-blue-400" />
                        <span className="text-lg font-bold text-white">Secure Payment</span>
                        <div className="flex space-x-2 ml-auto">
                          <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                          <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                      </p>
                    </div>
                    </div>
                  </div>

                {/* Order Summary */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Order Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">{selectedPackage.name} Package</span>
                      <span className="text-white font-bold">${selectedPackage.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Processing Fee</span>
                      <span className="text-white font-bold">$0</span>
                    </div>
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-white">Total</span>
                        <span className="text-2xl font-black text-green-400">${selectedPackage.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                  <button
                  type="submit"
                    disabled={isProcessing}
                  className="w-full btn-accent disabled:opacity-50 py-6 text-xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Lock className="w-6 h-6" />
                      <span>Complete Secure Payment</span>
                    </div>
                    )}
                  </button>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Lock className="w-5 h-5" />
                    <span className="text-sm font-medium">256-bit Encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Instant Access</span>
                  </div>
                </div>
              </form>
              </div>
          </motion.div>
        )}

        {/* Bottom Trust Section */}
        <div className="text-center mt-16">
          <p className="theme-text-muted mb-4">⭐ Trusted by 1000+ top-performing agents nationwide</p>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-black theme-text-primary">95%</div>
              <div className="text-sm theme-text-muted">Client Satisfaction</div>
            </div>
            <div className="w-px h-8 theme-border-primary"></div>
            <div className="text-center">
              <div className="text-2xl font-black theme-text-primary">24/7</div>
              <div className="text-sm theme-text-muted">Support Available</div>
            </div>
            <div className="w-px h-8 theme-border-primary"></div>
            <div className="text-center">
              <div className="text-2xl font-black theme-text-primary">100%</div>
              <div className="text-sm theme-text-muted">Money-back Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSelection; 