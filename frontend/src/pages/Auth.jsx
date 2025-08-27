import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  Brain,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Sparkles,
  Building,
  Award
} from 'lucide-react';
import Loader from '../components/Loader';

const Auth = ({ onLoginSuccess, onSignupSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Signup form data
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    licenseNumber: '',
    agreeTerms: false
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors = {};

    if (!signupData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(signupData.firstName.trim())) {
      newErrors.firstName = 'First name must contain only letters and single spaces between words';
    }

    if (!signupData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(signupData.lastName.trim())) {
      newErrors.lastName = 'Last name must contain only letters and single spaces between words';
    }

    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signupData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(signupData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!signupData.companyName.trim()) {
      newErrors.companyName = 'Company/Brokerage name is required';
    }

    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!signupData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSignupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const showSuccessNotification = (message, subtitle) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3';
    notification.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <div class="font-semibold">${message}</div>
        <div class="text-sm opacity-90">${subtitle}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      notification.style.transition = 'transform 0.3s ease-out';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setIsLoading(true);
    setErrors({});
    
    try {
      // Import the API utility
      const { api, showNotification } = await import('../utils/api');
      
      const response = await api.login(loginData.email, loginData.password);
      
      if (response.access || response.token) {
        const token = response.access || response.token;
        
        // Store tokens in localStorage for authentication
        if (response.access) {
          localStorage.setItem('access', response.access);
        }
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        if (response.refresh) {
          localStorage.setItem('refresh', response.refresh);
        }
        
        // Extract user data from response
        const userData = {
          id: response.user?.id,
          name: response.user ? 
            `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim() : 
            loginData.email.split('@')[0],
          email: response.user?.email || loginData.email,
          firstName: response.user?.first_name || '',
          lastName: response.user?.last_name || ''
        };
        
        showSuccessNotification('Login successful!', 'Welcome back!');
        if (onLoginSuccess) onLoginSuccess(response);
      } else {
        setErrors({ general: 'Invalid response from server' });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setErrors({ general: errorMessage });
      
      // Import and show error notification
      const { showNotification } = await import('../utils/api');
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;
    setIsLoading(true);
    setErrors({});
    
    try {
      // Import the API utility
      const { api, showNotification } = await import('../utils/api');
      
      // Trim first and last names before sending to backend
      const signupPayload = {
        ...signupData,
        firstName: signupData.firstName.trim(),
        lastName: signupData.lastName.trim(),
      };
      const response = await api.signup(signupPayload);
      
      if (response.access || response.token || response.user) {
        // Don't store tokens or log in automatically
        // Just show success message and switch to login
        showSuccessNotification('Account created successfully!', 'Please log in to continue');
        
        // Switch to login form
        setIsLogin(true);
        
        // Clear signup form
        setSignupData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          companyName: '',
          licenseNumber: '',
          agreeTerms: false
        });
        
        // Pre-fill login email for convenience
        setLoginData(prev => ({
          ...prev,
          email: signupPayload.email
        }));
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Handle specific validation errors
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        setErrors({ email: 'An account with this email already exists.' });
      } else if (error.message.includes('password')) {
        setErrors({ password: 'Password does not meet requirements.' });
      } else {
        setErrors({ form: errorMessage });
      }
      
      // Import and show error notification
      const { showNotification } = await import('../utils/api');
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'Weak', color: 'text-red-500' };
    if (password.length < 8) return { strength: 2, text: 'Fair', color: 'text-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 4, text: 'Strong', color: 'text-green-500' };
    }
          return { strength: 3, text: 'Good', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(signupData.password);

  return (
    <div className="min-h-screen theme-bg-primary flex">
      {/* Left Side - Professional Marketing Content */}
      <motion.div 
        className="flex-1 section-hero bg-pattern theme-text-primary p-12 flex flex-col justify-center relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent" />
        
        <div className="max-w-lg mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src="/Winning Listing Logo/WinningListing Gradient.png"
                  alt="Winning Listing"
                  className="h-12 w-auto mb-12"
                />
                
                <h1 className="text-5xl font-black theme-text-primary mb-6 leading-tight">
                  New to <span className="text-gradient">Winning Listing</span>?
                </h1>
                
                <p className="text-xl theme-text-secondary mb-8 leading-relaxed">
                  Join <span className="text-accent font-bold">1000+</span> real estate professionals creating 
                  <span className="text-accent font-bold"> compelling property presentations</span> with 
                  comprehensive market analysis and buyer insights.
                </p>
                
                <div className="space-y-4 mb-12">
                  {[
                    { icon: '🚀', text: 'Professional content creation in minutes' },
                    { icon: '🎨', text: 'Beautiful, branded digital presentations' },
                    { icon: '📊', text: 'Advanced market analysis & buyer insights' },
                    { icon: '📱', text: 'Mobile-optimized delivery & tracking' }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{background: 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)'}}>
                        {feature.icon}
                      </div>
                      <span className="text-lg theme-text-secondary font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={toggleMode}
                  className="btn-accent flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Start Free Today</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <p className="text-sm theme-text-muted mt-6">
                  ⭐ Trusted by top-performing agents nationwide
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8" style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}}>
                  <Users className="w-8 h-8" />
                </div>
                
                <h1 className="text-5xl font-black theme-text-primary mb-6 leading-tight">
                  Welcome Back to <span className="text-gradient">Success</span>
                </h1>
                
                <p className="text-xl theme-text-secondary mb-8 leading-relaxed">
                  Continue creating <span className="text-accent font-bold">professional presentations</span> that 
                  help you <span className="text-accent font-bold">win more listings</span> and close deals faster.
                </p>

                <div className="theme-bg-tertiary theme-border-primary backdrop-blur-sm rounded-2xl p-6 mb-8 border">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-lg theme-text-primary">"These presentations save me 10+ hours per listing!"</p>
                      <p className="theme-text-secondary text-sm">
                        Sarah Chen, Top 1% Real Estate Agent
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={toggleMode}
                  className="btn-primary flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="w-6 h-6" />
                  <span>Access Your Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex items-center justify-center px-8 theme-bg-secondary">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Login Header */}
                <div className="text-center mb-10">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}}>
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-black theme-text-primary mb-4">
                    Welcome Back
                  </h2>
                  <p className="text-lg theme-text-muted">
                    Sign in to create professional property presentations
                  </p>
                </div>

                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-6 w-6 theme-text-muted" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                        className={`input-field pl-14 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="agent@realestate.com"
                      />
                    </div>
                    {errors.email && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-6 w-6 theme-text-muted" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        className={`input-field pl-14 pr-14 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-6 w-6 theme-text-muted hover:theme-text-secondary" />
                        ) : (
                          <Eye className="h-6 w-6 theme-text-muted hover:theme-text-secondary" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        name="rememberMe"
                        type="checkbox"
                        checked={loginData.rememberMe}
                        onChange={handleLoginInputChange}
                        className="h-5 w-5 text-green-500 focus:ring-green-500 theme-border-secondary rounded theme-bg-tertiary"
                      />
                      <label className="ml-3 block text-sm theme-text-secondary font-medium">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-sm theme-text-secondary hover:theme-text-primary font-bold">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary disabled:opacity-50"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Signup Header */}
                <div className="text-center mb-10">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{background: 'linear-gradient(90deg, #00C4FF 0%, #0066CC 100%)'}}>
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-black theme-text-primary mb-4">
                    Start Winning Today
                  </h2>
                  <p className="text-lg theme-text-muted">
                    Join the platform that helps agents <span className="text-accent font-bold">close 3x faster</span>
                  </p>
                </div>

                {/* Signup Form */}
                <form className="space-y-6" onSubmit={handleSignupSubmit}>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-6 w-6 theme-text-muted" />
                        </div>
                        <input
                          name="firstName"
                          type="text"
                          value={signupData.firstName}
                          onChange={handleSignupInputChange}
                          className={`input-field pl-14 ${errors.firstName ? 'border-red-500' : ''}`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && (
                        <motion.p 
                          className="text-sm text-red-400 font-medium"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        type="text"
                        value={signupData.lastName}
                        onChange={handleSignupInputChange}
                        className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <motion.p 
                          className="text-sm text-red-400 font-medium"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.lastName}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-6 w-6 theme-text-muted" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        value={signupData.email}
                        onChange={handleSignupInputChange}
                        className={`input-field pl-14 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-6 w-6 theme-text-muted" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        value={signupData.phone}
                        onChange={handleSignupInputChange}
                        className={`input-field pl-14 ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  {/* Company/Brokerage Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                      Company/Brokerage Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building className="h-6 w-6 theme-text-muted" />
                      </div>
                      <input
                        name="companyName"
                        type="text"
                        value={signupData.companyName}
                        onChange={handleSignupInputChange}
                        className={`input-field pl-14 ${errors.companyName ? 'border-red-500' : ''}`}
                        placeholder="ABC Realty Group"
                      />
                    </div>
                    {errors.companyName && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.companyName}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-6 w-6 theme-text-muted" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.password}
                        onChange={handleSignupInputChange}
                        className={`input-field pl-14 pr-14 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-6 w-6 theme-text-muted hover:theme-text-secondary" />
                        ) : (
                          <Eye className="h-6 w-6 theme-text-muted hover:theme-text-secondary" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {signupData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 theme-bg-primary rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.strength === 1 ? 'w-1/4 bg-red-500' :
                                passwordStrength.strength === 2 ? 'w-2/4 bg-yellow-500' :
                                passwordStrength.strength === 3 ? 'w-3/4 bg-blue-500' :
                                passwordStrength.strength === 4 ? 'w-full bg-green-500' : 'w-0'
                              }`}
                            />
                          </div>
                          <span className={`text-sm font-bold ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold theme-text-primary uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-6 w-6 theme-text-muted" />
                      </div>
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupData.confirmPassword}
                        onChange={handleSignupInputChange}
                        className={`input-field pl-14 pr-14 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-6 w-6 theme-text-muted hover:theme-text-secondary" />
                        ) : (
                          <Eye className="h-6 w-6 theme-text-muted hover:theme-text-secondary" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>

                  {/* Terms Agreement */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        name="agreeTerms"
                        type="checkbox"
                        checked={signupData.agreeTerms}
                        onChange={handleSignupInputChange}
                        className="h-5 w-5 text-green-500 focus:ring-green-500 theme-border-secondary rounded mt-1 theme-bg-tertiary"
                      />
                      <label className="ml-3 block text-sm theme-text-secondary">
                        I agree to the{' '}
                        <a href="#" className="theme-text-secondary hover:theme-text-primary font-bold">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="theme-text-secondary hover:theme-text-primary font-bold">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <motion.p 
                        className="text-sm text-red-400 font-medium flex items-center space-x-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.agreeTerms}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-accent disabled:opacity-50"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <span>Start Winning Today</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;