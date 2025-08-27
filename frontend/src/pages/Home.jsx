import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Home as HomeIcon, 
  Brain, 
  FileText, 
  Zap, 
  Mail,
  Smartphone,
  Star,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  Eye,
  Trash2,
  MapPin,
  Calendar
} from 'lucide-react';

const Home = ({ onStartNewSearch, refreshTrigger }) => {
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Home.jsx - Checking authentication:', { token: !!token, userData: !!userData });
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Home.jsx - Setting user:', parsedUser);
        setUser(parsedUser);
        loadRecentAnalyses();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Refresh recent analyses when refreshTrigger changes
  useEffect(() => {
    if (user && refreshTrigger > 0) {
      console.log('Home.jsx - Refreshing recent analyses due to trigger:', refreshTrigger);
      loadRecentAnalyses();
    }
  }, [refreshTrigger, user]);

  const loadRecentAnalyses = async () => {
    console.log('Home.jsx - Loading recent analyses...');
    setIsLoadingAnalyses(true);
    try {
      const { api } = await import('../utils/api');
      const response = await api.getRecentAnalyses();
      console.log('Home.jsx - Recent analyses response:', response);
      setRecentAnalyses(response.analyses || []);
    } catch (error) {
      console.error('Error loading recent analyses:', error);
    } finally {
      setIsLoadingAnalyses(false);
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
      
      // Navigate to PropertyPreview by setting the state in the parent component
      // We'll need to communicate this to the parent component via a callback
      if (window.showPropertyPreview) {
        window.showPropertyPreview(fullAnalysis.address, mockPerplexityResult);
      } else {
        // Fallback: Create an event to communicate with parent
        const event = new CustomEvent('showPropertyPreview', {
          detail: {
            address: fullAnalysis.address,
            perplexityResult: mockPerplexityResult
          }
        });
        window.dispatchEvent(event);
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

  const features = [
    {
      icon: Brain,
      title: 'Professional Presentations',
      description: 'Create compelling property presentations that highlight unique selling points and market advantages.'
    },
    {
      icon: FileText,
      title: 'Beautiful Documentation',
      description: 'Generate stunning, shareable digital presentations that impress clients and close deals faster.'
    },
    {
      icon: Zap,
      title: 'Market Intelligence',
      description: 'Access comprehensive market data, comparable sales, and neighborhood insights in one place.'
    },
    {
      icon: Mail,
      title: 'Instant Delivery',
      description: 'Share your presentations instantly via email and SMS to reach clients wherever they are.'
    }
  ];

  const packages = [
    {
      name: 'Basic Package',
      price: '$29',
      features: [
        'Property data analysis',
        'Basic AI presentation',
        'Notion page creation',
        'Email delivery'
      ]
    },
    {
      name: 'Professional Package',
      price: '$59',
      features: [
        'Advanced market analysis',
        'Premium AI content',
        'Custom buyer personas',
        'Email + SMS delivery',
        'Priority support'
      ]
    },
    {
      name: 'Enterprise Package',
      price: '$99',
      features: [
        'Comprehensive market data',
        'Premium AI presentations',
        'Multiple buyer personas',
        'Multi-channel delivery',
        'White-label options',
        '24/7 support'
      ]
    }
  ];

  const stats = [
    { number: '500+', label: 'Presentations Created' },
    { number: '95%', label: 'Client Satisfaction' },
    { number: '2x', label: 'Faster Sales Process' },
    { number: '24/7', label: 'Platform Availability' }
  ];

  const workflow = [
    {
      step: '1',
      title: 'Submit Property Details',
      description: 'Enter property address, agent info, and select your preferred service package.',
      icon: HomeIcon
    },
    {
      step: '2',
      title: 'Content Creation',
      description: 'Our system analyzes your property and generates compelling presentation content.',
      icon: Brain
    },
    {
      step: '3',
      title: 'Professional Presentation',
      description: 'Beautiful, branded presentation is created with market data and buyer insights.',
      icon: FileText
    },
    {
      step: '4',
      title: 'Instant Delivery',
      description: 'Receive your presentation link and share it with clients immediately.',
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-800 dark:to-secondary-900 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold text-secondary-900 dark:text-secondary-50 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Professional{' '}
                  <motion.span 
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      backgroundSize: '200% 200%'
                    }}
                  >
                    Real Estate
                  </motion.span>{' '}
                  Presentations
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-secondary-600 dark:text-secondary-300 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Transform your property listings into compelling presentations that sell. 
                  Get custom content, market analysis, and buyer insights delivered in 
                  beautiful, shareable formats that close deals faster.
                </motion.p>
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <button
                  onClick={onStartNewSearch}
                  className="btn-primary inline-flex items-center justify-center space-x-2 group"
                >
                  <span>Start Creating Presentations</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <button
                  onClick={onStartNewSearch}
                  className="btn-secondary inline-flex items-center justify-center space-x-2"
                >
                  <span>Create New Analysis</span>
                </button>
              </motion.div>

              {/* Professional Registration Notice */}
              <motion.div 
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Enhanced Registration:</strong> Now includes company and license information for more professional presentations
                  </p>
                </div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex items-center space-x-6 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Trusted by real estate professionals worldwide
                </p>
              </motion.div>
            </motion.div>

            {/* Right Content - Workflow Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative">
                {/* Main Card */}
                <motion.div 
                  className="card p-8 transform rotate-3"
                  whileHover={{ rotate: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-50">
                        Presentation Ready
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        123 Main St, Downtown
                      </p>
                    </div>
                  </div>
                                      <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Market Analysis Complete
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Buyer Insights Ready
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Digital Presentation Created
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FileText className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Mail className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-secondary-600 dark:text-secondary-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Results Section - Only shown for logged-in users */}
      {user && (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">
                Your Recent Property Analyses
              </h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                Access your previously generated property presentations and insights
              </p>
            </motion.div>

            {isLoadingAnalyses ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : recentAnalyses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentAnalyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-gray-200 dark:border-secondary-700 p-6 hover:shadow-xl transition-shadow duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary-900 dark:text-secondary-50 text-sm leading-5 break-words overflow-hidden">
                            <span className="line-clamp-2">{analysis.address}</span>
                          </h3>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 truncate">
                            {analysis.package_name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-secondary-600 dark:text-secondary-400 truncate">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewAnalysis(analysis)}
                        className="flex-1 text-white px-4 py-2 font-medium transition-colors duration-200 flex items-center justify-center space-x-2 min-w-0"
                        style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)', borderRadius: '10px'}}
                        onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0052A3 0%, #00A3D6 100%)'}
                        onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}
                      >
                        <Eye className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">View Analysis</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gray-200 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                  No analyses yet
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                  Create your first property analysis to see it here
                </p>
                <button 
                  onClick={onStartNewSearch}
                  className="text-white px-6 py-3 font-medium transition-colors duration-200"
                  style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)', borderRadius: '10px'}}
                  onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0052A3 0%, #00A3D6 100%)'}
                  onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}
                >
                  Create Analysis
                </button>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              From property submission to professional presentations in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((item, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-4">
                  {item.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">
              Why Choose PropertyAI MVP
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Advanced technology meets real estate expertise to create presentations that sell properties faster
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card text-center group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-4">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">
              Choose Your Package
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Select the perfect package for your property presentation needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                className={`card text-center ${index === 1 ? 'ring-2 ring-primary-500 scale-105' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-2">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-primary-500">{pkg.price}</span>
                    <span className="text-secondary-600 dark:text-secondary-400 ml-2">/presentation</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-secondary-600 dark:text-secondary-400">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={onStartNewSearch}
                  className={`w-full btn-primary ${index === 1 ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Property Presentations?
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Join real estate professionals who are using AI to create compelling presentations 
              that sell properties faster with automated market analysis and buyer insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-white text-primary-500 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center justify-center space-x-2"
              >
                <span>Start Creating Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                className="border-2 border-white text-white hover:bg-white hover:text-primary-500 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 