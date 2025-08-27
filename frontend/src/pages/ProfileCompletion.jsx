import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building, 
  Award, 
  Target, 
  Camera,
  FileImage,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Star,
  Home,
  TrendingUp,
  Users,
  MapPin,
  Quote,
  Upload,
  X,
  Edit3,
  Save,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';
import ValidationPopup from '../components/ValidationPopup';

const ProfileCompletion = ({ user, onProfileUpdate, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Experience & Credibility
    yearsExperience: '',
    awards: '',
    specialty: '',
    shortestSale: '',
    highestSale: '',
    avgDaysOnMarket: '',
    
    // Personal Brand & Philosophy
    mission: '',
    valueProposition: '',
    sellingStyle: '',
    testimonial1: '',
    testimonial2: '',
    testimonial3: '',
    
    // Community Involvement
    communityTies: '',
    
    // Media
    headshot: null,
    logo: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState({
    headshot: null,
    logo: null
  });
  const [missingMsg, setMissingMsg] = useState('');
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [dragStates, setDragStates] = useState({
    headshot: false,
    logo: false
  });

  const steps = [
    {
      number: 1,
      title: 'Media',
      description: 'Photos & branding',
      icon: Camera
    },
    {
      number: 2,
      title: 'Experience',
      description: 'Your background',
      icon: Award
    },
    {
      number: 3,
      title: 'Personal Brand',
      description: 'What makes you unique',
      icon: Target
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
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!file) {
      setMissingMsg('Please select a file');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setMissingMsg('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    if (file.size > maxSize) {
      setMissingMsg('File size must be less than 5MB');
      return;
    }
    
    setProfileData(prev => ({ ...prev, [field]: file }));
    setMissingMsg(''); // Clear missingMsg when an image is uploaded
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(prev => ({
        ...prev,
        [field]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e, field) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [field]: true }));
  };

  const handleDragLeave = (e, field) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [field]: false }));
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [field]: false }));
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(field, files[0]);
    }
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateProfileData = () => {
    const missingFieldNames = [];
    
    // Check if at least one performance stat is provided (this is the main requirement for completion)
    const hasPerformanceStats = profileData.shortestSale || profileData.highestSale || profileData.avgDaysOnMarket;
    if (!hasPerformanceStats) {
      missingFieldNames.push('At least one Performance Statistic');
    }
    
    // Note: Essential fields (firstName, lastName, email, companyName) should already be set from signup
    // and headshot/logo are optional for profile completion
    
    return missingFieldNames;
  };

  const handleSaveProfile = async () => {
    // Validate before saving
    const missing = validateProfileData();
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationPopup(true);
      return;
    }
    
    setIsLoading(true);
    try {
      // Merge user info and set profileCompleted
      const payload = {
        ...profileData,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        companyName: user?.companyName || '',
        licenseNumber: user?.licenseNumber || '',
        phone: user?.phone || '',
        profileCompleted: true,
      };
      
      try {
        const { api, showNotification } = await import('../utils/api');
        await api.updateProfile(payload);
        // Refetch user profile to get latest image URLs
        const updatedUser = await api.getUserProfile();
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser);
        }
        showNotification('Profile updated successfully!', 'success');
      } catch (apiError) {
        console.error('API utility failed:', apiError);
        // Fallback: direct fetch with JSON
        const token = localStorage.getItem('token');
        const response = await fetch('https://real-estate-api-ejqg.onrender.com/api/auth/profile/', {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error('Profile update failed');
        }
        // Refetch user profile to get latest image URLs
        const { api, showNotification } = await import('../utils/api');
        const updatedUser = await api.getUserProfile();
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser);
        }
        showNotification('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const { showNotification } = await import('../utils/api');
      showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Camera className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold theme-text-primary mb-2">Professional Photos</h3>
        <p className="theme-text-secondary">Upload your headshot and company logo (optional)</p>
      </div>

      {/* Headshot Upload */}
      <div className="card-feature">
        <label className="block text-sm font-medium theme-text-primary mb-3">
          Professional Headshot
        </label>
        <div 
          className={`flex flex-col items-center p-6 border-2 border-dashed rounded-lg transition-colors ${
            dragStates.headshot 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'theme-border-secondary hover:theme-border-primary'
          }`}
          onDragOver={(e) => handleDragOver(e, 'headshot')}
          onDragLeave={(e) => handleDragLeave(e, 'headshot')}
          onDrop={(e) => handleDrop(e, 'headshot')}
        >
          {previewImage.headshot ? (
            <div className="relative">
              <img
                src={previewImage.headshot}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-full border-4 border-blue-500"
              />
              <button
                onClick={() => {
                  setPreviewImage(prev => ({ ...prev, headshot: null }));
                  setProfileData(prev => ({ ...prev, headshot: null }));
                }}
                className="absolute -top-2 -right-2 text-white rounded-full p-1 transition-colors"
                style={{background: 'linear-gradient(90deg, #ff4444 0%, #cc0000 100%)', borderRadius: '50%'}}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #cc0000 0%, #990000 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #ff4444 0%, #cc0000 100%)'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 theme-bg-tertiary rounded-full border-2 border-dashed theme-border-secondary flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 theme-text-muted" />
            </div>
          )}
          <p className="text-sm theme-text-secondary mb-2 text-center">
            {dragStates.headshot ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload('headshot', e.target.files[0])}
            className="hidden"
            id="headshot-upload"
          />
          <label
            htmlFor="headshot-upload"
            className="mt-4 btn-primary cursor-pointer inline-flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Headshot
          </label>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="card-feature">
        <label className="block text-sm font-medium theme-text-primary mb-3">
          Company/Personal Logo
        </label>
        <div 
          className={`flex flex-col items-center p-6 border-2 border-dashed rounded-lg transition-colors ${
            dragStates.logo 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'theme-border-secondary hover:theme-border-primary'
          }`}
          onDragOver={(e) => handleDragOver(e, 'logo')}
          onDragLeave={(e) => handleDragLeave(e, 'logo')}
          onDrop={(e) => handleDrop(e, 'logo')}
        >
          {previewImage.logo ? (
            <div className="relative">
              <img
                src={previewImage.logo}
                alt="Logo Preview"
                className="w-32 h-24 object-contain border-2 border-blue-500 rounded-lg p-2 theme-bg-secondary"
              />
              <button
                onClick={() => {
                  setPreviewImage(prev => ({ ...prev, logo: null }));
                  setProfileData(prev => ({ ...prev, logo: null }));
                }}
                className="absolute -top-2 -right-2 text-white rounded-full p-1 transition-colors"
                style={{background: 'linear-gradient(90deg, #ff4444 0%, #cc0000 100%)', borderRadius: '50%'}}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #cc0000 0%, #990000 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #ff4444 0%, #cc0000 100%)'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-24 theme-bg-tertiary rounded-lg border-2 border-dashed theme-border-secondary flex items-center justify-center mb-4">
              <FileImage className="w-8 h-8 theme-text-muted" />
            </div>
          )}
          <p className="text-sm theme-text-secondary mb-2 text-center">
            {dragStates.logo ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload('logo', e.target.files[0])}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className="mt-4 btn-primary cursor-pointer inline-flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Logo
          </label>
        </div>
      </div>

      {missingMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{missingMsg}</p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Award className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold theme-text-primary mb-2">Experience & Credentials</h3>
        <p className="theme-text-secondary">Share your professional background</p>
      </div>

      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Years of Experience</label>
        <input
          type="text"
          value={profileData.yearsExperience}
          onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
          className="form-input"
          placeholder="e.g., 5 years, 10+ years"
        />
      </div>

      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Real Estate Specialty</label>
        <select
          value={profileData.specialty}
          onChange={(e) => handleInputChange('specialty', e.target.value)}
          className="form-input"
        >
          <option value="">Select specialty...</option>
          {specialtyOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Awards & Certifications</label>
        <textarea
          value={profileData.awards}
          onChange={(e) => handleInputChange('awards', e.target.value)}
          className="form-input"
          rows="3"
          placeholder="Top Producer 2023, Luxury Specialist Certification..."
        />
      </div>

      <div className="card-feature">
        <h3 className="font-semibold theme-text-primary mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Performance Statistics
        </h3>
        <p className="text-sm theme-text-secondary mb-4">Add at least one statistic to complete your profile</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Shortest Sale
            </label>
            <input
              type="text"
              value={profileData.shortestSale}
              onChange={(e) => handleInputChange('shortestSale', e.target.value)}
              className="form-input"
              placeholder="e.g., 7 days"
            />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Highest Sale
            </label>
            <input
              type="text"
              value={profileData.highestSale}
              onChange={(e) => handleInputChange('highestSale', e.target.value)}
              className="form-input"
              placeholder="e.g., $2.5M"
            />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Avg Days on Market
            </label>
            <input
              type="text"
              value={profileData.avgDaysOnMarket}
              onChange={(e) => handleInputChange('avgDaysOnMarket', e.target.value)}
              className="form-input"
              placeholder="e.g., 30 days"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    // Mission statement template options
    const missionTemplates = [
      {
        label: "Select a template or write your own...",
        value: ""
      },
      {
        label: "Client-Focused Service",
        value: "I help families find their dream homes by combining market expertise with personalized service, ensuring every client feels supported throughout their real estate journey."
      },
      {
        label: "First-Time Buyer Specialist",
        value: "I believe everyone deserves to achieve homeownership. My mission is to guide first-time buyers through every step, making the process clear, stress-free, and empowering."
      },
      {
        label: "Community-Focused Agent",
        value: "I'm passionate about connecting people with the perfect neighborhood where they can build lasting memories and relationships while growing their investment."
      },
      {
        label: "Investment & Growth Oriented",
        value: "I help clients build wealth through strategic real estate investments, focusing on long-term value and market opportunities that align with their financial goals."
      },
      {
        label: "Luxury Market Expert",
        value: "I provide white-glove service to discerning clients, ensuring their luxury real estate experience reflects the exceptional quality they expect and deserve."
      }
    ];

    // Value proposition template options
    const valuePropositionTemplates = [
      {
        label: "Select a template or write your own...",
        value: ""
      },
      {
        label: "Data-Driven Marketing",
        value: "I maximize your property's exposure through data-backed pricing strategies, targeted digital marketing, and comprehensive market analysis that gets results."
      },
      {
        label: "Technology & Innovation",
        value: "I leverage cutting-edge technology, virtual tours, and digital marketing to ensure your property reaches the widest audience of qualified buyers."
      },
      {
        label: "Local Market Expertise",
        value: "As a lifelong local resident, I provide insider knowledge of neighborhoods, schools, and market trends that out-of-area agents simply can't match."
      },
      {
        label: "Proven Track Record",
        value: "With a consistent record of selling homes faster and for more money than the market average, I deliver results that exceed expectations."
      },
      {
        label: "Full-Service Support",
        value: "From staging and photography to negotiations and closing, I handle every detail so you can focus on your next chapter while I handle the sale."
      },
      {
        label: "Relationship-First Approach",
        value: "I build lasting relationships by truly listening to your needs, providing honest guidance, and staying connected long after closing day."
      }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold theme-text-primary mb-2">Personal Brand</h3>
          <p className="theme-text-secondary">Define what makes you unique using our templates or write your own</p>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Your Mission</label>
          <div className="space-y-3">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleInputChange('mission', e.target.value);
                }
              }}
              className="form-input text-sm"
            >
              {missionTemplates.map((template, index) => (
                <option key={index} value={template.value}>{template.label}</option>
              ))}
            </select>
            <textarea
              value={profileData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              className="form-input"
              rows="3"
              placeholder="I help families find their dream homes by combining market expertise with personalized service..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Unique Value Proposition</label>
          <div className="space-y-3">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleInputChange('valueProposition', e.target.value);
                }
              }}
              className="form-input text-sm"
            >
              {valuePropositionTemplates.map((template, index) => (
                <option key={index} value={template.value}>{template.label}</option>
              ))}
            </select>
            <textarea
              value={profileData.valueProposition}
              onChange={(e) => handleInputChange('valueProposition', e.target.value)}
              className="form-input"
              rows="3"
              placeholder="I focus on maximizing ROI through data-backed marketing strategies..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Selling Style</label>
          <select
            value={profileData.sellingStyle}
            onChange={(e) => handleInputChange('sellingStyle', e.target.value)}
            className="form-input"
          >
            <option value="">Select your approach...</option>
            {sellingStyleOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="card-feature">
          <h3 className="font-semibold theme-text-primary mb-4 flex items-center">
            <Quote className="w-5 h-5 mr-2" />
            Client Testimonials
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">Testimonial 1</label>
              <input
                type="text"
                value={profileData.testimonial1}
                onChange={(e) => handleInputChange('testimonial1', e.target.value)}
                className="form-input"
                placeholder='"John made selling our home effortless!" - Sarah M.'
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">Testimonial 2</label>
              <input
                type="text"
                value={profileData.testimonial2}
                onChange={(e) => handleInputChange('testimonial2', e.target.value)}
                className="form-input"
                placeholder='"Professional and knowledgeable." - Mike R.'
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">Testimonial 3</label>
              <input
                type="text"
                value={profileData.testimonial3}
                onChange={(e) => handleInputChange('testimonial3', e.target.value)}
                className="form-input"
                placeholder='"Excellent communication throughout." - Lisa J.'
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Community Involvement</label>
          <textarea
            value={profileData.communityTies}
            onChange={(e) => handleInputChange('communityTies', e.target.value)}
            className="form-input"
            rows="3"
            placeholder="Local neighborhood connections, community organizations..."
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen theme-bg-primary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Complete Your Agent Profile</h1>
          <p className="theme-text-secondary">
            Add detailed information to create more professional property presentations
          </p>
        </div>

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
                      isActive ? 'bg-blue-500 text-white' :
                      'theme-bg-tertiary theme-text-muted'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isActive ? 'theme-text-secondary' : 'theme-text-muted'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs theme-text-muted">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded transition-colors ${
                      currentStep > step.number ? 'bg-green-500' : 'theme-bg-tertiary'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="card">
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
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 theme-border-secondary border-t">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 theme-text-secondary hover:theme-text-primary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm theme-text-muted">
                Step {currentStep} of {steps.length}
              </span>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="btn-accent disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Complete Profile</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 rounded-2xl p-8 text-white" style={{background: 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)'}}>
          <h3 className="text-xl font-bold mb-4">Why Complete Your Profile?</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Build Trust</h4>
              <p className="text-sm opacity-90">Showcase your expertise and credentials</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Stand Out</h4>
              <p className="text-sm opacity-90">Differentiate yourself from competitors</p>
            </div>
            <div className="text-center">
              <Home className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Professional Presentations</h4>
              <p className="text-sm opacity-90">Create impressive property analyses</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Validation Popup */}
      <ValidationPopup
        isOpen={showValidationPopup}
        onClose={() => setShowValidationPopup(false)}
        missingFields={missingFields}
        title="Profile Completion Required"
      />
    </div>
  );
};

export default ProfileCompletion;