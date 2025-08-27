import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Award, 
  Target, 
  Camera,
  FileImage,
  Save,
  Loader2,
  Star,
  Home,
  TrendingUp,
  Users,
  MapPin,
  ArrowRight
} from 'lucide-react';
import ValidationPopup from './ValidationPopup';

const BACKEND_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'https://real-estate-api-ejqg.onrender.com';

function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/media/')) return `${BACKEND_URL}${path}`;
  if (path.startsWith('media/')) return `${BACKEND_URL}/${path}`;
  return path;
}

const ProfileEditor = ({ user, onUpdate, onClose }) => {
  // Log the decoded JWT token payload for inspection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        console.log('Decoded JWT token payload:', JSON.parse(jsonPayload));
      } catch (e) {
        console.log('Could not decode token:', e);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    // Basic info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Professional details
    companyName: '',
    licenseNumber: '',
    yearsExperience: '',
    awards: '',
    specialty: '',
    shortestSale: '',
    highestSale: '',
    avgDaysOnMarket: '',
    
    // Personal brand
    mission: '',
    valueProposition: '',
    sellingStyle: '',
    testimonial1: '',
    testimonial2: '',
    testimonial3: '',
    
    // Community & media
    communityTies: '',
    headshot: null,
    logo: null,
    currentHeadshot: '',
    currentLogo: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  // Initialize form data from user prop
  useEffect(() => {
    if (user) {
      console.log('ProfileEditor - User object:', user);
      console.log('ProfileEditor - User profile:', user.profile);
      console.log('ProfileEditor - All user profile keys:', Object.keys(user.profile || {}));
      console.log('ProfileEditor - All user keys:', Object.keys(user));
      console.log('ProfileEditor - Direct headshot value:', user.headshot);
      console.log('ProfileEditor - Direct logo value:', user.logo);
      console.log('ProfileEditor - Profile headshot value:', user.profile?.headshot);
      console.log('ProfileEditor - Profile logo value:', user.profile?.logo);
      
      // Helper function to get image URL from various possible locations
      const getImageFromUser = (field) => {
        // Try different possible locations for the image
        const possiblePaths = [
          user[field],
          user.profile?.[field],
          user.profile?.[field === 'headshot' ? 'headshot' : 'logo'],
          user[field === 'headshot' ? 'headshot' : 'logo'],
          // Try different field name variations
          user.profile?.[field === 'headshot' ? 'headshot_url' : 'logo_url'],
          user.profile?.[field === 'headshot' ? 'headshotUrl' : 'logoUrl'],
          user.profile?.[field === 'headshot' ? 'profile_headshot' : 'profile_logo'],
          user.profile?.[field === 'headshot' ? 'agent_headshot' : 'company_logo'],
          // Check if the field exists but is empty
          user.profile?.[field] || user[field]
        ];
        
        console.log(`ProfileEditor - Searching for ${field} in:`, possiblePaths);
        
        for (const path of possiblePaths) {
          if (path && path !== '' && path !== null) {
            console.log(`ProfileEditor - Found ${field} at:`, path);
            return path;
          }
        }
        console.log(`ProfileEditor - No ${field} found in user object`);
        return '';
      };

      setFormData({
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || '',
        phone: user.phone || user.phone_number || '',
        companyName: user.companyName || user.company_name || '',
        licenseNumber: user.licenseNumber || user.license_number || '',
        yearsExperience: user.yearsExperience || user.years_experience || '',
        awards: user.awards || '',
        specialty: user.specialty || '',
        shortestSale: user.shortestSale || user.shortest_sale || '',
        highestSale: user.highestSale || user.highest_sale || '',
        avgDaysOnMarket: user.avgDaysOnMarket || user.avg_days_on_market || '',
        mission: user.mission || '',
        valueProposition: user.valueProposition || user.value_proposition || '',
        sellingStyle: user.sellingStyle || user.selling_style || '',
        testimonial1: user.testimonial1 || user.testimonial_1 || '',
        testimonial2: user.testimonial2 || user.testimonial_2 || '',
        testimonial3: user.testimonial3 || user.testimonial_3 || '',
        communityTies: user.communityTies || user.community_ties || '',
        headshot: null,
        logo: null,
        currentHeadshot: getImageFromUser('headshot'),
        currentLogo: getImageFromUser('logo')
      });
    }
  }, [user]);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Building },
    { id: 'brand', label: 'Personal Brand', icon: Target },
    { id: 'media', label: 'Media & Community', icon: Camera }
  ];

  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
      return true;
    }
    return false; // No more tabs
  };

  const specialtyOptions = [
    { value: '', label: 'Select specialty' },
    { value: 'first_time_buyers', label: 'First-time Home Buyers' },
    { value: 'luxury_homes', label: 'Luxury Homes' },
    { value: 'investment_properties', label: 'Investment Properties' },
    { value: 'downsizing', label: 'Downsizing/Senior Living' },
    { value: 'new_construction', label: 'New Construction' },
    { value: 'commercial', label: 'Commercial Real Estate' },
    { value: 'rural_farm', label: 'Rural/Farm Properties' },
    { value: 'foreclosures', label: 'Foreclosures/REO' },
    { value: 'relocation', label: 'Relocation Services' },
    { value: 'military_va', label: 'Military/VA Loans' }
  ];

  const sellingStyleOptions = [
    { value: '', label: 'Select selling style' },
    { value: 'consultative', label: 'Consultative Approach' },
    { value: 'aggressive_marketing', label: 'Aggressive Marketing' },
    { value: 'white_glove', label: 'White-Glove Service' },
    { value: 'data_driven', label: 'Data-Driven Strategy' },
    { value: 'relationship_focused', label: 'Relationship-Focused' },
    { value: 'technology_forward', label: 'Technology-Forward' },
    { value: 'full_service', label: 'Full-Service Support' }
  ];

  // Removed experienceOptions array since we're changing to text input

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const [dragStates, setDragStates] = useState({
    headshot: false,
    logo: false
  });

  const handleFileUpload = (field, file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!file) {
      setErrors(prev => ({ ...prev, [field]: 'Please select a file' }));
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [field]: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' }));
      return;
    }
    
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: '' }));
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

  const validateForm = () => {
    const newErrors = {};
    const missingFieldNames = [];

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      missingFieldNames.push('First Name');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      missingFieldNames.push('Last Name');
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      missingFieldNames.push('Email');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      missingFieldNames.push('Valid Email');
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
      missingFieldNames.push('Company Name');
    }

    // Check if at least one performance stat is provided
    const hasPerformanceStats = formData.shortestSale || formData.highestSale || formData.avgDaysOnMarket;
    if (!hasPerformanceStats) {
      newErrors.performanceStats = 'Please provide at least one performance statistic (Shortest Sale, Highest Sale, Avg Days on Market)';
      missingFieldNames.push('At least one Performance Statistic');
    }

    setErrors(newErrors);
    
    // Show validation popup if there are missing fields
    if (missingFieldNames.length > 0) {
      setMissingFields(missingFieldNames);
      setShowValidationPopup(true);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    console.log('Update button clicked');
    if (!validateForm()) {
      console.log('Validation failed', errors, formData);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Importing API...');
      const { api, showNotification } = await import('../utils/api');
      console.log('API imported, calling updateProfile...');
      const response = await api.updateProfile(formData);
      console.log('Profile updated, response:', response);
      
      // Use the response from the backend instead of creating our own updatedUser
      // The backend returns the updated profile data with correct headshot/logo URLs
      let updatedUser;
      if (response.user) {
        // Backend returned user object with profile
        updatedUser = {
          ...response.user,
          ...response.user.profile
        };
      } else {
        // Fallback to creating updated user object
        updatedUser = {
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          profile: {
            ...user.profile,
            phone: formData.phone,
            companyName: formData.companyName,
            licenseNumber: formData.licenseNumber,
            yearsExperience: formData.yearsExperience,
            awards: formData.awards,
            specialty: formData.specialty,
            shortestSale: formData.shortestSale,
            highestSale: formData.highestSale,
            avgDaysOnMarket: formData.avgDaysOnMarket,
            mission: formData.mission,
            valueProposition: formData.valueProposition,
            sellingStyle: formData.sellingStyle,
            testimonial1: formData.testimonial1,
            testimonial2: formData.testimonial2,
            testimonial3: formData.testimonial3,
            communityTies: formData.communityTies,
            // Update file URLs if new files were uploaded
            headshot: formData.headshot ? URL.createObjectURL(formData.headshot) : (formData.currentHeadshot || user.headshot),
            logo: formData.logo ? URL.createObjectURL(formData.logo) : (formData.currentLogo || user.logo)
          }
        };
      }

      console.log('Updated user object:', updatedUser);
      showNotification('Profile updated successfully!', 'success');
      
      // Move to next tab instead of closing modal
      const hasNextTab = goToNextTab();
      
      // Only update parent and close if we're on the last tab
      if (!hasNextTab) {
        onUpdate(updatedUser);
        onClose();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const { showNotification } = await import('../utils/api');
      // Check for token expiration error - but don't immediately logout
      if (
        error?.message?.includes('token_not_valid') ||
        error?.detail?.includes('token not valid') ||
        (error?.messages && error.messages.some(m => m.message?.toLowerCase().includes('expired')))
      ) {
        console.log('Token error detected in ProfileEditor, but not logging out immediately');
        showNotification('Authentication issue detected. Please try again or refresh the page.', 'warning');
        return;
      }
      showNotification(error.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      console.log('isLoading set to false');
    }
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">First Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-5 h-5" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`form-input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="John"
            />
          </div>
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
            placeholder="Doe"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Email Address *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-5 h-5" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`form-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="john.doe@example.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-5 h-5" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="form-input pl-10"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Company/Brokerage Name *</label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-5 h-5" />
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className={`form-input pl-10 ${errors.companyName ? 'border-red-500' : ''}`}
            placeholder="Prime Realty Group"
          />
        </div>
        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">License Number</label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            className="form-input"
            placeholder="RE123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Years of Experience</label>
          <input
            type="text"
            value={formData.yearsExperience}
            onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
            className="form-input"
            placeholder="e.g., 5 years, 10+ years"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Specialty/Niche</label>
        <select
          value={formData.specialty}
          onChange={(e) => handleInputChange('specialty', e.target.value)}
          className="form-input"
        >
          {specialtyOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium theme-text-primary mb-2">Awards & Certifications</label>
        <textarea
          value={formData.awards}
          onChange={(e) => handleInputChange('awards', e.target.value)}
          rows={3}
          className="form-input"
          placeholder="Top Producer 2023, Certified Residential Specialist, GRI..."
        />
      </div>

      <div className="space-y-4">
        <div className="card-feature rounded-lg p-4">
          <h3 className="text-sm font-medium theme-text-primary mb-2">Notable Performance Stats *</h3>
          <p className="text-sm theme-text-secondary">
            Please provide at least one performance statistic to complete your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Shortest Sale</label>
            <input
              type="text"
              value={formData.shortestSale}
              onChange={(e) => handleInputChange('shortestSale', e.target.value)}
              className="form-input"
              placeholder="3 days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Highest Sale</label>
            <input
              type="text"
              value={formData.highestSale}
              onChange={(e) => handleInputChange('highestSale', e.target.value)}
              className="form-input"
              placeholder="$2.8M"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium theme-text-primary mb-2">Avg Days on Market</label>
            <input
              type="text"
              value={formData.avgDaysOnMarket}
              onChange={(e) => handleInputChange('avgDaysOnMarket', e.target.value)}
              className="form-input"
              placeholder="15 days"
            />
          </div>
        </div>
        {errors.performanceStats && <p className="text-red-500 text-sm mt-2">{errors.performanceStats}</p>}
      </div>
    </div>
  );

  const renderBrandTab = () => {
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
        <div className="card-feature rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium theme-text-primary mb-2">Personal Brand & Philosophy (Optional)</h3>
          <p className="text-sm theme-text-secondary">
            This section is optional but helps create a more compelling profile presentation. Use the templates below or write your own.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Mission Statement</label>
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
              value={formData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              rows={3}
              className="form-input"
              placeholder="Your 'why' for doing real estate..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Value Proposition</label>
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
              value={formData.valueProposition}
              onChange={(e) => handleInputChange('valueProposition', e.target.value)}
              rows={3}
              className="form-input"
              placeholder="What makes you unique in the market..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">Selling Style</label>
          <select
            value={formData.sellingStyle}
            onChange={(e) => handleInputChange('sellingStyle', e.target.value)}
            className="form-input"
          >
            {sellingStyleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold theme-text-primary">Client Testimonials (Optional)</h3>
          <p className="text-sm theme-text-secondary">Add up to 3 testimonials from satisfied clients.</p>
          
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Client Testimonial 1</label>
            <textarea
              value={formData.testimonial1}
              onChange={(e) => handleInputChange('testimonial1', e.target.value)}
              rows={2}
              className="form-input"
              placeholder="Quote from a satisfied client..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Client Testimonial 2</label>
            <textarea
              value={formData.testimonial2}
              onChange={(e) => handleInputChange('testimonial2', e.target.value)}
              rows={2}
              className="form-input"
              placeholder="Another client success story..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Client Testimonial 3</label>
            <textarea
              value={formData.testimonial3}
              onChange={(e) => handleInputChange('testimonial3', e.target.value)}
              rows={2}
              className="form-input"
              placeholder="Third client testimonial..."
            />
          </div>
        </div>
      </div>
    );
  };

  const renderMediaTab = () => {
    console.log('ProfileEditor - renderMediaTab - formData:', {
      currentHeadshot: formData.currentHeadshot,
      currentLogo: formData.currentLogo,
      headshot: formData.headshot,
      logo: formData.logo
    });
    
    return (
      <div className="space-y-6">
        <div className="card-feature rounded-lg p-4">
          <h3 className="text-sm font-medium theme-text-primary mb-2">Professional Media (Required)</h3>
          <p className="text-sm theme-text-secondary">
            Upload a professional headshot and company logo to complete your profile.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-2">Community Ties</label>
          <textarea
            value={formData.communityTies}
            onChange={(e) => handleInputChange('communityTies', e.target.value)}
            rows={3}
            className="form-input"
            placeholder="Your local connections and community involvement..."
          />
          <p className="text-xs theme-text-muted mt-1">Local involvement, charity work, neighborhood expertise</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Professional Headshot</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors theme-bg-secondary ${
                dragStates.headshot 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'theme-border-secondary hover:theme-border-primary'
              }`}
              onDragOver={(e) => handleDragOver(e, 'headshot')}
              onDragLeave={(e) => handleDragLeave(e, 'headshot')}
              onDrop={(e) => handleDrop(e, 'headshot')}
            >
              {/* Show current headshot if available */}
              {(formData.currentHeadshot || formData.headshot) && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={formData.headshot ? URL.createObjectURL(formData.headshot) : getImageUrl(formData.currentHeadshot)}
                      alt="Current headshot"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200"
                      onError={(e) => {
                        console.log('Headshot image failed to load:', formData.currentHeadshot);
                        console.log('Headshot image URL attempted:', getImageUrl(formData.currentHeadshot));
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Headshot image loaded successfully:', formData.currentHeadshot);
                      }}
                    />
                    {formData.headshot && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </div>
                    )}
                  </div>
                  <p className="text-sm theme-text-muted mt-2">
                    {formData.headshot ? 'New headshot selected' : 'Current headshot'}
                  </p>
                  {formData.currentHeadshot && !formData.headshot && (
                    <p className="text-xs theme-text-muted mt-1">Click "Choose File" to replace</p>
                  )}
                </div>
              )}
              
              {/* Show upload interface if no current image */}
              {!formData.currentHeadshot && !formData.headshot && (
                <>
                  <FileImage className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                  <p className="text-sm theme-text-secondary mb-2">
                    {dragStates.headshot ? 'Drop image here' : 'Upload Your Professional Headshot'}
                  </p>
                  <p className="text-xs theme-text-muted mb-2">No headshot uploaded yet</p>
                  <p className="text-xs theme-text-muted mb-6">Supported: JPEG, PNG, GIF, WebP</p>
                </>
              )}
              
              <input
                type="file"
                accept=".jpeg,.jpg,.png,.gif,.webp,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => handleFileUpload('headshot', e.target.files[0])}
                className="hidden"
                id="headshot-upload"
              />
              <label
                htmlFor="headshot-upload"
                className="btn-secondary cursor-pointer text-center mt-4"
              >
                {formData.currentHeadshot || formData.headshot ? 'Replace Headshot' : 'Upload Headshot'}
              </label>
              {errors.headshot && <p className="text-red-400 text-sm mt-2">{errors.headshot}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Company Logo</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors theme-bg-secondary ${
                dragStates.logo 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'theme-border-secondary hover:theme-border-primary'
              }`}
              onDragOver={(e) => handleDragOver(e, 'logo')}
              onDragLeave={(e) => handleDragLeave(e, 'logo')}
              onDrop={(e) => handleDrop(e, 'logo')}
            >
              {/* Show current logo if available */}
              {(formData.currentLogo || formData.logo) && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={formData.logo ? URL.createObjectURL(formData.logo) : getImageUrl(formData.currentLogo)}
                      alt="Current logo"
                      className="w-24 h-24 object-contain mx-auto border-2 border-gray-200 bg-white rounded-lg"
                      onError={(e) => {
                        console.log('Logo image failed to load:', formData.currentLogo);
                        console.log('Logo image URL attempted:', getImageUrl(formData.currentLogo));
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Logo image loaded successfully:', formData.currentLogo);
                      }}
                    />
                    {formData.logo && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </div>
                    )}
                  </div>
                  <p className="text-sm theme-text-muted mt-2">
                    {formData.logo ? 'New logo selected' : 'Current logo'}
                  </p>
                  {formData.currentLogo && !formData.logo && (
                    <p className="text-xs theme-text-muted mt-1">Click "Choose File" to replace</p>
                  )}
                </div>
              )}
              
              {/* Show upload interface if no current image */}
              {!formData.currentLogo && !formData.logo && (
                <>
                  <Building className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                  <p className="text-sm theme-text-secondary mb-2">
                    {dragStates.logo ? 'Drop image here' : 'Upload Your Company Logo'}
                  </p>
                  <p className="text-xs theme-text-muted mb-2">No logo uploaded yet</p>
                  <p className="text-xs theme-text-muted mb-6">Supported: JPEG, PNG, GIF, WebP</p>
                </>
              )}
              
              <input
                type="file"
                accept=".jpeg,.jpg,.png,.gif,.webp,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => handleFileUpload('logo', e.target.files[0])}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="btn-secondary cursor-pointer text-center mt-4"
              >
                {formData.currentLogo || formData.logo ? 'Replace Logo' : 'Upload Logo'}
              </label>
              {errors.logo && <p className="text-red-400 text-sm mt-2">{errors.logo}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="card rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 theme-border-secondary border-b">
            <h2 className="text-2xl font-bold theme-text-primary">Edit Profile</h2>
            <button
              onClick={onClose}
              className="theme-text-muted hover:theme-text-primary transition-colors p-2 hover:theme-bg-tertiary rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="theme-border-secondary border-b">
            <div className="flex flex-wrap gap-4 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent theme-text-muted hover:theme-text-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 theme-bg-primary min-h-0">
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'professional' && renderProfessionalTab()}
            {activeTab === 'brand' && renderBrandTab()}
            {activeTab === 'media' && renderMediaTab()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 theme-bg-primary theme-border-secondary border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm theme-text-muted text-center sm:text-left">
              All fields marked with * are required
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 theme-border-secondary border theme-text-secondary rounded-lg hover:theme-bg-tertiary transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="disabled:opacity-50 theme-text-primary px-6 py-2 font-medium transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
                style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)', borderRadius: '10px'}}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0052A3 0%, #00A3D6 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {activeTab === 'media' ? <Save className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{activeTab === 'media' ? 'Update Profile' : 'Next'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Validation Popup */}
        <ValidationPopup
          isOpen={showValidationPopup}
          onClose={() => setShowValidationPopup(false)}
          missingFields={missingFields}
          title="Profile Update Required"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileEditor;