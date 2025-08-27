import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building, 
  Award, 
  Target, 
  Upload,
  Camera,
  FileImage,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Star,
  Home,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';

const AgentOnboarding = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Professional Details
    companyName: '',
    licenseNumber: '',
    yearsExperience: '',
    awards: '',
    specialty: '',
    shortestSale: '',
    highestSale: '',
    avgDaysOnMarket: '',
    
    // Step 3: Personal Brand
    mission: '',
    valueProposition: '',
    sellingStyle: '',
    testimonial1: '',
    testimonial2: '',
    testimonial3: '',
    
    // Step 4: Community & Media
    communityTies: '',
    headshot: null,
    logo: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      number: 1,
      title: 'Basic Information',
      description: 'Create your account',
      icon: User
    },
    {
      number: 2,
      title: 'Professional Details',
      description: 'Your real estate background',
      icon: Building
    },
    {
      number: 3,
      title: 'Personal Brand',
      description: 'What makes you unique',
      icon: Target
    },
    {
      number: 4,
      title: 'Media & Community',
      description: 'Photos and local connections',
      icon: Camera
    }
  ];

  const specialtyOptions = [
    'First-time Home Buyers',
    'Luxury Homes',
    'Investment Properties',
    'Downsizing/Senior Living',
    'New Construction',
    'Commercial Real Estate',
    'Rural/Farm Properties',
    'Foreclosures/REO',
    'Relocation Services',
    'Military/VA Loans'
  ];

  const sellingStyleOptions = [
    'Consultative Approach',
    'Aggressive Marketing',
    'White-Glove Service',
    'Data-Driven Strategy',
    'Relationship-Focused',
    'Technology-Forward',
    'Full-Service Support'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field, file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, [field]: file }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: 'Please select a valid image file' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
      
      case 2:
        if (!formData.companyName.trim()) newErrors.companyName = 'Company/Brokerage name is required';
        // Check if at least one performance stat is provided
        const hasPerformanceStats = formData.shortestSale || formData.highestSale || formData.avgDaysOnMarket;
        if (!hasPerformanceStats) {
          newErrors.performanceStats = 'Please provide at least one performance statistic (Shortest Sale, Highest Sale, Avg Days on Market)';
        }
        break;
      
      // Steps 3 and 4 are optional, no validation needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Import API utility
      const { api, showNotification } = await import('../utils/api');
      
      // Register the user with complete profile
      const response = await api.signup({
        ...formData,
        username: formData.email // Use email as username
      });

      if (response.access || response.token) {
        const token = response.access || response.token;
        const userData = {
          id: response.user?.id,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          profile: {
            companyName: formData.companyName,
            licenseNumber: formData.licenseNumber,
            yearsExperience: formData.yearsExperience,
            specialty: formData.specialty,
            mission: formData.mission
          }
        };
        
        showNotification('Welcome! Your profile has been created successfully!', 'success');
        
        if (onComplete) onComplete(token, userData);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const { showNotification } = await import('../utils/api');
      showNotification(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
        <p className="text-slate-300 mt-2">Let's start with your basic information</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400 ${errors.firstName ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="John"
            />
          </div>
          {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400 ${errors.lastName ? 'border-red-500' : 'border-slate-600'}`}
            placeholder="Doe"
          />
          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400 ${errors.email ? 'border-red-500' : 'border-slate-600'}`}
            placeholder="john@realestate.com"
          />
        </div>
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400 ${errors.phone ? 'border-red-500' : 'border-slate-600'}`}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400 ${errors.password ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'}`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Professional Details</h2>
        <p className="text-slate-300 mt-2">Tell us about your real estate background</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Company/Brokerage Name *</label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400 ${errors.companyName ? 'border-red-500' : 'border-slate-600'}`}
            placeholder="ABC Realty Group"
          />
        </div>
        {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">License Number (Optional)</label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
            placeholder="RE12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Years of Experience</label>
          <select
            value={formData.yearsExperience}
            onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
            className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
          >
            <option value="">Select...</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="6-10 years">6-10 years</option>
            <option value="11-15 years">11-15 years</option>
            <option value="16-20 years">16-20 years</option>
            <option value="20+ years">20+ years</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Specialty/Niche</label>
        <select
          value={formData.specialty}
          onChange={(e) => handleInputChange('specialty', e.target.value)}
          className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
        >
          <option value="">Select your specialty...</option>
          {specialtyOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Awards & Certifications (Optional)</label>
        <textarea
          value={formData.awards}
          onChange={(e) => handleInputChange('awards', e.target.value)}
          className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
          rows="3"
          placeholder="e.g., Top Producer 2023, CRS Certified, Million Dollar Club"
        />
      </div>

      <div className="space-y-4">
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Notable Performance Stats *</h3>
          <p className="text-sm text-slate-200">
            Please provide at least one performance statistic to complete your profile.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Shortest Sale (Days)</label>
            <input
              type="number"
              value={formData.shortestSale}
              onChange={(e) => handleInputChange('shortestSale', e.target.value)}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
              placeholder="7"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Highest Sale ($)</label>
            <input
              type="number"
              value={formData.highestSale}
              onChange={(e) => handleInputChange('highestSale', e.target.value)}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
              placeholder="1500000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Avg Days on Market</label>
            <input
              type="number"
              value={formData.avgDaysOnMarket}
              onChange={(e) => handleInputChange('avgDaysOnMarket', e.target.value)}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
              placeholder="25"
            />
          </div>
        </div>
        {errors.performanceStats && <p className="text-red-400 text-sm mt-2">{errors.performanceStats}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Personal Brand & Philosophy</h2>
        <p className="text-slate-300 mt-2">What makes you unique as an agent? (Optional)</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-amber-800 mb-2">Personal Brand & Philosophy (Optional)</h3>
        <p className="text-sm text-amber-700">
          This section is optional but helps create a more compelling profile presentation.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Your Mission or "Why"</label>
        <textarea
          value={formData.mission}
          onChange={(e) => handleInputChange('mission', e.target.value)}
          className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
          rows="3"
          placeholder="I help families find their dream homes by combining market expertise with personalized service..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Unique Value Proposition</label>
        <textarea
          value={formData.valueProposition}
          onChange={(e) => handleInputChange('valueProposition', e.target.value)}
          className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
          rows="3"
          placeholder="I focus on maximizing ROI for sellers through data-backed marketing strategies..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Selling Style</label>
        <select
          value={formData.sellingStyle}
          onChange={(e) => handleInputChange('sellingStyle', e.target.value)}
          className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
        >
          <option value="">Select your approach...</option>
          {sellingStyleOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-white">Client Testimonials (Optional)</label>
        
        <div>
          <input
            type="text"
            value={formData.testimonial1}
            onChange={(e) => handleInputChange('testimonial1', e.target.value)}
            className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
            placeholder='Testimonial 1: "John made selling our home effortless..." - Sarah M.'
          />
        </div>

        <div>
          <input
            type="text"
            value={formData.testimonial2}
            onChange={(e) => handleInputChange('testimonial2', e.target.value)}
            className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
            placeholder='Testimonial 2: "Professional and knowledgeable..." - Mike R.'
          />
        </div>

        <div>
          <input
            type="text"
            value={formData.testimonial3}
            onChange={(e) => handleInputChange('testimonial3', e.target.value)}
            className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
            placeholder='Testimonial 3: "Excellent communication throughout the process..." - Lisa J.'
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Media & Community</h2>
        <p className="text-slate-300 mt-2">Add your photos and community connections</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Community Ties</label>
        <textarea
          value={formData.communityTies}
          onChange={(e) => handleInputChange('communityTies', e.target.value)}
          className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-400 text-white bg-slate-700 placeholder-slate-400"
          rows="3"
          placeholder="I've lived in Downtown Springfield for 15 years and serve the surrounding neighborhoods..."
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Professional Headshot</label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-200 mb-2">Upload your professional headshot</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('headshot', e.target.files[0])}
              className="hidden"
              id="headshot-upload"
            />
            <label
              htmlFor="headshot-upload"
              className="bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors inline-block"
            >
              Choose File
            </label>
            {formData.headshot && (
              <p className="text-green-400 text-sm mt-2">✓ {formData.headshot.name}</p>
            )}
            {errors.headshot && <p className="text-red-400 text-sm mt-2">{errors.headshot}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Company Logo</label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <FileImage className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-200 mb-2">Upload your company logo</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('logo', e.target.files[0])}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors inline-block"
            >
              Choose File
            </label>
            {formData.logo && (
              <p className="text-green-400 text-sm mt-2">✓ {formData.logo.name}</p>
            )}
            {errors.logo && <p className="text-red-400 text-sm mt-2">{errors.logo}</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="font-semibold text-slate-300 mb-2">Ready to Create Amazing Presentations!</h3>
        <p className="text-slate-200 text-sm">
          Your detailed profile will help create more personalized and professional property presentations 
          that reflect your expertise and build trust with potential clients.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-slate-600 text-white' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded transition-colors ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-slate-600'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-600">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>
              )}
              {currentStep === 1 && onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back to Login</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOnboarding; 