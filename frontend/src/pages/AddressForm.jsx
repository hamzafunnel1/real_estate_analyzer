import React, { useState, useEffect } from 'react';
import { MapPin, Search, ArrowRight, Clock, X, Eye, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';

const AddressForm = ({ onSubmit, onPerplexityResult, onBack, refreshTrigger, user: propUser, isAuthenticated }) => {
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);

  // Use user prop if available, otherwise fallback to localStorage
  const user = propUser || (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  })();

  // Load recent analyses when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('AddressForm.jsx - Loading recent analyses for authenticated user');
      loadRecentAnalyses();
    }
  }, [isAuthenticated, user]);

  // Refresh recent analyses when refreshTrigger changes
  useEffect(() => {
    if (user && refreshTrigger > 0) {
      console.log('AddressForm.jsx - Refreshing recent analyses due to trigger:', refreshTrigger);
        loadRecentAnalyses();
    }
  }, [refreshTrigger, user]);

  const loadRecentAnalyses = async () => {
    setIsLoadingAnalyses(true);
    try {
      // Add a small delay to ensure tokens are properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { api } = await import('../utils/api');
      
      // Check if we have a valid token before making the API call
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      if (!token || token === 'demo-token') {
        console.log('No valid token found, skipping recent analyses load');
        return;
      }
      
      const response = await api.getRecentAnalyses();
      setRecentAnalyses(response.analyses || []);
    } catch (error) {
      console.error('Error loading recent analyses:', error);
      // Don't show error to user if it's an authentication issue
      if (error.message && error.message.includes('401')) {
        console.log('Authentication error loading recent analyses - this is expected for new users');
      }
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address.trim()) {
      setIsSubmitting(true);
      try {
        // This goes to package selection - original flow
        onSubmit(address);
      } catch (error) {
        console.error('Error:', error);
        alert('Error processing address');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleViewAnalysis = async (analysis) => {
    try {
      // Fetch the full analysis data from the database
      const { api } = await import('../utils/api');
      const fullAnalysis = await api.getPropertyAnalysis(analysis.id);
      
      // Create a mock perplexity result object with the saved data
      const mockPerplexityResult = {
        choices: [{
          message: {
            content: fullAnalysis.analysis_content
          }
        }],
        model: fullAnalysis.analysis_model,
        usage: fullAnalysis.api_response?.usage || {}
      };
      
      // Navigate to PropertyPreview by calling onPerplexityResult
      if (onPerplexityResult) {
        onPerplexityResult(fullAnalysis.address, mockPerplexityResult);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      alert('Error loading analysis. Please try again.');
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        const { api } = await import('../utils/api');
        await api.deletePropertyAnalysis(analysisId);
        setRecentAnalyses(prev => prev.filter(a => a.id !== analysisId));
      } catch (error) {
        console.error('Error deleting analysis:', error);
        alert('Error deleting analysis');
      }
    }
  };

  const handleUseAddress = (analysisAddress) => {
    setAddress(analysisAddress);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen theme-bg-primary flex">
      {/* Recent Analyses Sidebar */}
      {user && recentAnalyses.length > 0 && (
        <div className="w-80 theme-bg-secondary shadow-2xl p-6 theme-border-primary border-r">
          <h2 className="text-xl font-bold theme-text-primary mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-blue-400" />
            Recent Property Analyses
          </h2>
          {isLoadingAnalyses ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="card-feature hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold theme-text-primary break-words line-clamp-2 mb-2">
                        {analysis.address}
                      </p>
                      <p className="text-sm text-blue-400 font-medium">
                        {analysis.package_name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnalysis(analysis.id)}
                      className="theme-text-muted hover:text-red-400 transition-colors ml-3 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center text-sm theme-text-muted mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(analysis.created_at)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleViewAnalysis(analysis)}
                      className="px-3 py-2 text-white font-bold transition-all duration-300 text-sm"
                                      style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)', borderRadius: '10px'}}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0052A3 0%, #00A3D6 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}
                    >
                      View Results
                    </button>
                    <button
                      onClick={() => handleUseAddress(analysis.address)}
                      className="px-3 py-2 theme-bg-tertiary hover:theme-bg-secondary theme-text-primary rounded-lg font-bold transition-all duration-300 text-sm theme-border-secondary border"
                    >
                      Use Address
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 section-hero bg-pattern flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black theme-text-primary mb-6 leading-tight">
              Power Your <span className="text-gradient">Winning</span> Listings
            </h1>
            <p className="text-xl theme-text-secondary mb-8 leading-relaxed max-w-xl mx-auto">
              Get <span className="text-accent font-bold">comprehensive property analysis</span> and 
              <span className="text-accent font-bold"> professional presentations</span> in minutes
            </p>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-black theme-text-primary">1000+</div>
                <div className="text-sm theme-text-muted">Agents</div>
              </div>
              <div className="w-px h-12 theme-border-primary"></div>
              <div className="text-center">
                <div className="text-3xl font-black theme-text-primary">5★</div>
                <div className="text-sm theme-text-muted">Rating</div>
              </div>
              <div className="w-px h-12 theme-border-primary"></div>
              <div className="text-center">
                <div className="text-3xl font-black theme-text-primary">10K+</div>
                <div className="text-sm theme-text-muted">Properties</div>
              </div>
            </div>
        </div>

          {/* Main Form Card */}
          <div className="card max-w-lg mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <label htmlFor="address" className="block text-lg font-bold theme-text-primary mb-4 uppercase tracking-wide">
                Property Address
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <MapPin className="h-7 w-7 theme-text-muted" />
                  </div>
      <input
                  id="address"
        type="text"
        value={address}
        onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                    className="input-field pl-16 pr-6 py-5"
                  required
                />
              </div>
                <p className="text-sm theme-text-muted mt-3 text-center">
                Include street address, city, state, and ZIP code for best results
              </p>
            </div>

              {/* Search Button */}
            <button
              type="submit"
              disabled={!address.trim() || isSubmitting}
                className="w-full btn-primary disabled:opacity-50 py-6 text-xl"
            >
              {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Searching...</span>
                  </div>
              ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Search className="w-6 h-6" />
                    <span>Search Property</span>
                  <ArrowRight className="w-5 h-5" />
                  </div>
              )}
            </button>
          </form>

            {/* Feature Highlights */}
            <div className="mt-8 pt-8 theme-border-primary border-t">
              <h3 className="text-lg font-bold theme-text-primary mb-4 text-center">What You Get</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-sm theme-text-secondary">Market Analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm theme-text-secondary">Professional Presentation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm theme-text-secondary">Buyer Insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-sm theme-text-secondary">Mobile Ready</span>
                </div>
              </div>
          </div>
        </div>

          {/* Bottom Trust */}
          <div className="text-center mt-12">
            <p className="text-sm theme-text-muted">
              ⭐ Trusted by top-performing agents nationwide
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm; 