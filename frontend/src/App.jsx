import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './utils/stripe';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './pages/Auth';
import AddressForm from './pages/AddressForm';
import PackageSelection from './pages/PackageSelection';
import PropertyPreview from './pages/PropertyPreview';
import SharedAnalysis from './pages/SharedAnalysis';
import ProfileCompletion from './pages/ProfileCompletion';
import ProfileEditor from './components/ProfileEditor';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { api } from './utils/api';
import { X } from 'lucide-react';

// Main App Component with Routing
function App() {
  return (
    <ThemeProvider>
      <Elements stripe={stripePromise}>
        <Router>
          <AppContent />
        </Router>
      </Elements>
    </ThemeProvider>
  );
}

// Main App Content Component
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [perplexityResult, setPerplexityResult] = useState(null);
  const [perplexityAddress, setPerplexityAddress] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Utility function to clear all auth data
  const clearAllAuthData = () => {
    api.clearAuthData();
    sessionStorage.removeItem('token');
    // Remove token cookie
    document.cookie = 'token=; Max-Age=0; path=/;';
    // Clear session storage but keep localStorage for persistence
    sessionStorage.clear();
    // Remove auth cookies but keep other data
    document.cookie.split(";").forEach((c) => {
      if (c.includes('token') || c.includes('auth')) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });
    setIsAuthenticated(false);
    setUser(null);
    setAddress(null);
    setSelectedPackage(null);
    setPaymentComplete(false);
    setProfileComplete(false);
    setShowProfileModal(false);
    setShowProfileCompletion(false);
  };

  // On mount (page load/refresh), check for existing auth tokens
  useEffect(() => {
    // Don't clear auth data on mount - let the initializeApp function handle it
  }, []);

  // Prevent session clearing when tab is closed and add periodic token refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Don't clear auth data when tab is closed
      // The session will persist in localStorage
    };

    const handleVisibilityChange = () => {
      // When tab becomes visible again, check if we need to refresh tokens
      if (!document.hidden && isAuthenticated) {
        console.log('Tab became visible, checking authentication...');
        // Refresh token if needed
        refreshTokenIfNeeded();
      }
    };

    // Periodic token refresh every 3 hours (3 * 60 * 60 * 1000 ms)
    const tokenRefreshInterval = setInterval(() => {
      if (isAuthenticated) {
        console.log('Periodic token refresh check...');
        refreshTokenIfNeeded();
      }
    }, 3 * 60 * 60 * 1000);

    const refreshTokenIfNeeded = async () => {
      try {
        const token = localStorage.getItem('access') || localStorage.getItem('token');
        if (token && token !== 'demo-token') {
          // Check if token is about to expire (within 30 minutes)
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const tokenExp = tokenData.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (tokenExp - now < thirtyMinutes) {
            console.log('Token expiring soon, refreshing...');
            await api.refreshToken();
            console.log('Token refreshed successfully');
          }
        }
      } catch (error) {
        console.error('Error during token refresh:', error);
        // Don't logout on refresh error, just log it
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(tokenRefreshInterval);
    };
  }, [isAuthenticated]);

  // Add event listener for showing PropertyPreview from recent searches
  useEffect(() => {
    const handleShowPropertyPreview = (event) => {
      const { address, perplexityResult } = event.detail;
      setPerplexityAddress(address);
      setPerplexityResult(perplexityResult);
    };

    window.addEventListener('showPropertyPreview', handleShowPropertyPreview);
    
    // Also set up the global function for compatibility
    window.showPropertyPreview = (address, perplexityResult) => {
      setPerplexityAddress(address);
      setPerplexityResult(perplexityResult);
    };

    return () => {
      window.removeEventListener('showPropertyPreview', handleShowPropertyPreview);
      delete window.showPropertyPreview;
    };
  }, []);

  // Check if profile is actually complete based on backend logic
  const checkProfileCompletion = (userObj) => {
    if (!userObj) return false;
    
    // Backend mark_profile_complete() checks:
    // 1. Essential fields: company_name, first_name, last_name, email
    // 2. At least one performance stat: shortest_sale, highest_sale, avg_days_on_market
    
    // Check essential fields (support both camelCase and snake_case)
    const companyName = userObj.companyName || userObj.company_name || '';
    const firstName = userObj.firstName || userObj.first_name || '';
    const lastName = userObj.lastName || userObj.last_name || '';
    const email = userObj.email || '';
    
    const hasEssentialFields = !!(companyName && firstName && lastName && email);
    
    // Check performance stats (support both camelCase and snake_case)
    const shortestSale = userObj.shortestSale || userObj.shortest_sale || '';
    const highestSale = userObj.highestSale || userObj.highest_sale || '';
    const avgDaysOnMarket = userObj.avgDaysOnMarket || userObj.avg_days_on_market || '';
    
    const hasPerformanceStats = !!(shortestSale || highestSale || avgDaysOnMarket);
    
    console.log('Profile completion check:', {
      companyName,
      firstName, 
      lastName,
      email,
      shortestSale,
      highestSale,
      avgDaysOnMarket,
      hasEssentialFields,
      hasPerformanceStats,
      isComplete: hasEssentialFields && hasPerformanceStats
    });
    
    return hasEssentialFields && hasPerformanceStats;
  };

  // Initialize user and profile state on app startup
  useEffect(() => {
    const initializeApp = async () => {
      console.log('App startup - initializing...');
      
      // Don't clear auth data on startup - check if tokens exist first
      
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      if (token && token !== 'demo-token') {
        try {
          // First check if the token is still valid
          const isTokenValid = await api.checkTokenValidity();
          
          if (!isTokenValid) {
            console.log('Token invalid, attempting refresh...');
            // Try to refresh the token
            try {
              await api.refreshToken();
              console.log('Token refreshed successfully');
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              // If refresh fails, clear auth data but don't redirect
              api.clearAuthData();
              setIsAuthenticated(false);
              setUser(null);
              setProfileComplete(false);
              return;
            }
          }
          
          // Now fetch user profile with valid token
          const response = await api.getUserProfile();
          let userObj = response.user ? { ...response.user, ...response.user.profile } : response;
          
          // Ensure image URLs are properly mapped
          if (userObj.profile) {
            userObj.headshot = userObj.profile.headshot || userObj.headshot;
            userObj.logo = userObj.profile.logo || userObj.logo;
          }
          
          setUser(userObj);
          setIsAuthenticated(true);
          
          const isComplete = checkProfileCompletion(userObj);
          setProfileComplete(isComplete);
          
          // Store updated user data
          localStorage.setItem('user', JSON.stringify(userObj));
          localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If profile fetch fails, clear everything
          api.clearAuthData();
          setIsAuthenticated(false);
          setUser(null);
          setProfileComplete(false);
        }
      }
    };
    
    initializeApp();
  }, []);
  
  // Handle login success
  const handleLoginSuccess = (userData) => {
    console.log('Login success - user data:', userData);
    let userObj = userData.user ? { ...userData.user, ...userData.user.profile } : userData;
    
    // Ensure image URLs are properly mapped
    if (userObj.profile) {
      userObj.headshot = userObj.profile.headshot || userObj.headshot;
      userObj.logo = userObj.profile.logo || userObj.logo;
    }
    
    setUser(userObj);
    setIsAuthenticated(true);
    
    const isComplete = checkProfileCompletion(userObj);
    setProfileComplete(isComplete);
    
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
  };

  // Handle signup success
  // Remove or simplify the handleSignupSuccess function
  const handleSignupSuccess = (userData) => {
  // This function can be removed or simplified since we're not auto-logging in
  console.log('Signup completed, user should now login');
  };
  
  // In the Auth component call, you can remove onSignupSuccess or keep it simple:
  <Auth 
  onLoginSuccess={handleLoginSuccess}
  onSignupSuccess={handleSignupSuccess} // Can be removed or kept as no-op
  onBack={() => setShowAuthModal(false)}
  />

  // Handle logout
  const handleLogout = () => {
    api.clearAuthData();
    setIsAuthenticated(false);
    setAddress(null);
    setSelectedPackage(null);
    setPaymentComplete(false);
    setPerplexityResult(null);
    setPerplexityAddress(null);
    setShowProfileModal(false);
  };

  // Handle profile completion
  const handleProfileComplete = async (profileData) => {
    // After profile update, refetch user profile to get image URLs
    try {
      const response = await api.getUserProfile();
      let userObj = response.user ? { ...response.user, ...response.user.profile } : response;
      
      // Ensure image URLs are properly mapped
      if (userObj.profile) {
        userObj.headshot = userObj.profile.headshot || userObj.headshot;
        userObj.logo = userObj.profile.logo || userObj.logo;
      }
      
      setUser(userObj);
      const isComplete = checkProfileCompletion(userObj);
      setProfileComplete(isComplete);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
    } catch (e) {
      setProfileComplete(false);
    }
  };

  // Handle profile update from profile editor
  const handleProfileUpdate = (updatedUserData) => {
    // Ensure image URLs are properly mapped
    if (updatedUserData.profile) {
      updatedUserData.headshot = updatedUserData.profile.headshot || updatedUserData.headshot;
      updatedUserData.logo = updatedUserData.profile.logo || updatedUserData.logo;
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
    setShowProfileModal(false);
  };

  // Handle profile completion from dedicated completion flow
  const handleProfileCompleteFromNavigation = async (profileData) => {
    // After profile update, refetch user profile to get latest data
    try {
      const response = await api.getUserProfile();
      let userObj = response.user ? { ...response.user, ...response.user.profile } : response;
      
      // Log the updated user data for debugging
      console.log('Updated user data after profile completion:', userObj);
      
      const isComplete = checkProfileCompletion(userObj);
      console.log('Profile completion status after update:', isComplete);
      
      setUser(userObj);
      setProfileComplete(isComplete);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('profileComplete', isComplete ? 'true' : 'false');
      setShowProfileCompletion(false);
      
      // If profile is now complete, force a refresh to show "Edit Profile" option
      if (isComplete) {
        console.log('Profile is now complete - should show Edit Profile option');
      }
    } catch (e) {
      console.error('Error refreshing user profile after completion:', e);
      setProfileComplete(false);
      setShowProfileCompletion(false);
    }
  };

  // Skip profile completion for now
  const handleSkipProfile = () => {
    setProfileComplete(true);
    localStorage.setItem('profileComplete', 'true');
  };

  // Handle going back to address form (homepage)
  const handleBackToHome = () => {
    setAddress(null);
    setSelectedPackage(null);
    setPaymentComplete(false);
    setPerplexityResult(null);
    setPerplexityAddress(null);
    // Trigger refresh of recent analyses when going back to homepage
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle address submission
  const handleAddressSubmit = (newAddress) => {
    setAddress(newAddress);
    // Save search to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newSearch = {
      address: newAddress,
      timestamp: Date.now(),
      id: Date.now()
    };
    const updatedSearches = [newSearch, ...recentSearches.filter(s => s.address !== newAddress)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Handle package selection and payment
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setTimeout(() => setPaymentComplete(true), 1000);
  };

  // Handle starting over
  const handleStartOver = () => {
    setAddress(null);
    setSelectedPackage(null);
    setPaymentComplete(false);
    setPerplexityResult(null);
    setPerplexityAddress(null);
    setShowProfileModal(false);
    // Trigger refresh of recent analyses when starting over
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePerplexityResult = (address, result) => {
    setPerplexityAddress(address);
    setPerplexityResult(result);
    // Trigger refresh of recent analyses since a new one was likely saved
    setRefreshTrigger(prev => prev + 1);
  }
  // Handler for Perplexity result
  // const handlePerplexityResult = async (address, perplexityData) => {
  //   try {
  //     const res = await fetch('/api/auth/notion/format/', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ perplexity_data: perplexityData }),
  //     });
  //     if (!res.ok) throw new Error('Failed to format with Notion');
  //     const notionResult = await res.json();

  //     // Navigate to the new page with the result
  //     navigate('/notion-result', { state: { notionResult } });
  //   } catch (err) {
  //     alert('Error sending data to Notion: ' + err.message);
  //   }
  // };

  const handleBackFromPerplexity = () => {
    setPerplexityResult(null);
    setPerplexityAddress(null);
  };

  const property = address && selectedPackage && paymentComplete
    ? { address, package: selectedPackage }
    : null;

  return (
    <div className="App">
      <Routes>
        {/* Shared Analysis Route */}
        <Route 
          path="/shared/:shareId" 
          element={<SharedAnalysis />} 
        />
        
        {/* Main App Routes */}
        <Route 
          path="*" 
          element={
            <>
              <Navbar 
                isAuthenticated={isAuthenticated}
                user={user}
                onBack={handleBackToHome}
                onProfile={async () => {
                  try {
                    const response = await api.getUserProfile();
                    let userObj = response.user ? { ...response.user, ...response.user.profile } : response;
                    setUser(userObj);
                    const isComplete = checkProfileCompletion(userObj);
                    localStorage.setItem('user', JSON.stringify(userObj));
                    
                    // Check if profile is complete - if not, show ProfileCompletion, otherwise show ProfileEditor
                    if (isComplete) {
                      setShowProfileModal(true);
                    } else {
                      setShowProfileCompletion(true);
                    }
                  } catch (e) {
                    // If API fails, assume profile incomplete and show completion
                    setShowProfileCompletion(true);
                  }
                }}
                onLogout={handleLogout}
                showBackButton={!!(address || selectedPackage || paymentComplete || perplexityResult)}
              />
              
              {/* Profile Editor Modal */}
              {showProfileModal && (
                <ProfileEditor
                  user={user}
                  onUpdate={handleProfileUpdate}
                  onClose={() => setShowProfileModal(false)}
                />
              )}

              {/* Profile Completion Modal */}
              {showProfileCompletion && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                  <div className="max-w-5xl w-full max-h-[95vh] overflow-y-auto relative">
                    <button
                      onClick={() => setShowProfileCompletion(false)}
                      className="absolute top-4 right-4 z-10 theme-text-muted hover:theme-text-primary theme-bg-secondary hover:theme-bg-tertiary rounded-lg p-2 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="theme-bg-primary min-h-screen">
                      <ProfileCompletion 
                        user={user} 
                        onProfileUpdate={handleProfileCompleteFromNavigation} 
                        onSkip={() => setShowProfileCompletion(false)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {perplexityResult ? (
                <PropertyPreview
                  property={property}
                  onStartOver={handleBackFromPerplexity}
                  user={user}
                  perplexityResult={perplexityResult}
                  perplexityAddress={perplexityAddress}
                />
              ) : !isAuthenticated ? (
                <Auth 
                  onLoginSuccess={handleLoginSuccess}
                  onSignupSuccess={handleSignupSuccess}
                  onBack={() => setShowAuthModal(false)}
                />
              ) : !address ? (
                <AddressForm 
                  onSubmit={handleAddressSubmit} 
                  onPerplexityResult={handlePerplexityResult} 
                  onBack={null} 
                  refreshTrigger={refreshTrigger}
                  user={user}
                  isAuthenticated={isAuthenticated}
                />
              ) : !profileComplete ? (
                <ProfileCompletion 
                  user={user} 
                  onProfileUpdate={handleProfileComplete} 
                  onSkip={handleSkipProfile} 
                />
              ) : !selectedPackage || !paymentComplete ? (
                <PackageSelection onSelect={handlePackageSelect} onPerplexityResult={handlePerplexityResult} onBack={handleBackToHome} address={address} />
              ) : (
                <PropertyPreview 
                  property={property} 
                  onStartOver={handleStartOver}
                  user={user}
                  perplexityResult={perplexityResult}
                  perplexityAddress={perplexityAddress}
                />
              )}

              <Footer />
            </>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
