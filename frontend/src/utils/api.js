// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Mock API responses for development (used after authentication)
const MOCK_RESPONSES = {
  propertyData: (address) => ({
    success: true,
    data: {
      address,
      price: 450000 + Math.floor(Math.random() * 200000),
      beds: 3 + Math.floor(Math.random() * 3),
      baths: 2 + Math.floor(Math.random() * 2),
      sqft: 1800 + Math.floor(Math.random() * 1000),
      yearBuilt: 1995 + Math.floor(Math.random() * 25),
      description: 'Beautiful family home in a great neighborhood with excellent schools and amenities.',
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500'
      ]
    }
  })
};

// Utility function to create delay (simulate network latency)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API class for handling requests
class API {
  constructor() {
    this.useMockDataForAuth = false; // Use real backend for authentication
    this.useMockDataForOthers = false; // Disable mock data for all endpoints
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        ...options.headers,
      },
      ...options,
    };

    // Set Content-Type to application/json only if not using FormData
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    // Always use 'access' if present, fallback to 'token' for legacy/demo
    let token = localStorage.getItem('access') || localStorage.getItem('token');
    
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      // Use real backend for authentication endpoints
      if (this.isAuthEndpoint(endpoint)) {
        const response = await fetch(url, config);
        
        // Read response body only once
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, create empty object
          data = {};
        }
        
        // Handle token expiration for auth endpoints
        if (response.status === 401) {
          const errorMessage = data.detail || data.message || data.error || '';
          
          // Only handle token expiration for auth endpoints, not all 401 errors
          if (this.isAuthEndpoint(endpoint) && 
              errorMessage.toLowerCase().includes('token') && 
              (errorMessage.toLowerCase().includes('expired') || 
               errorMessage.toLowerCase().includes('invalid') || 
               errorMessage.toLowerCase().includes('not valid'))) {
            
            console.log('Token expired on auth endpoint, attempting refresh...');
            
            // Try to refresh the token first
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ refresh: refreshToken }),
                });
                
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  
                  // Store new tokens
                  if (refreshData.access) {
                    localStorage.setItem('token', refreshData.access);
                    localStorage.setItem('access', refreshData.access);
                  }
                  if (refreshData.refresh) {
                    localStorage.setItem('refresh', refreshData.refresh);
                  }
                  
                  // Retry the original request with new token
                  const newConfig = {
                    ...config,
                    headers: {
                      ...config.headers,
                      Authorization: `Bearer ${refreshData.access}`,
                    },
                  };
                  
                  const retryResponse = await fetch(url, newConfig);
                  const retryData = await retryResponse.json();
                  
                  if (!retryResponse.ok) {
                    throw new Error(retryData.message || retryData.detail || retryData.error || 'Request failed after token refresh');
                  }
                  
                  return retryData;
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }
            
            // Only clear auth data and redirect if refresh failed
            console.log('Token refresh failed, clearing auth data...');
            this.clearAuthData();
            
            throw new Error('Session expired. Please log in again.');
          }
        }

        if (!response.ok) {
          throw new Error(data.message || data.detail || data.error || 'Authentication failed');
        }

        return data;
      }

      // Use mock data for other endpoints
      if (this.useMockDataForOthers) {
        await delay(800 + Math.random() * 1200); // Simulate network delay
        return this.getMockResponse(endpoint, options.body ? JSON.parse(options.body) : null);
      }

      // Fallback to real API (for future integration)
      const response = await fetch(url, config);
      
      // Read response body only once
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, create empty object
        data = {};
      }
      
      // Handle token expiration with automatic refresh
      if (response.status === 401) {
        const errorMessage = data.detail || data.message || data.error || '';
        
        // Check for token expiration/invalid token
        if (errorMessage.toLowerCase().includes('token') && 
            (errorMessage.toLowerCase().includes('expired') || 
             errorMessage.toLowerCase().includes('invalid') || 
             errorMessage.toLowerCase().includes('not valid'))) {
          
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                
                // Store new tokens
                if (refreshData.access) {
                  localStorage.setItem('token', refreshData.access);
                  localStorage.setItem('access', refreshData.access);
                }
                if (refreshData.refresh) {
                  localStorage.setItem('refresh', refreshData.refresh);
                }
                
                // Retry the original request with new token
                const newConfig = {
                  ...config,
                  headers: {
                    ...config.headers,
                    Authorization: `Bearer ${refreshData.access}`,
                  },
                };
                
                const retryResponse = await fetch(url, newConfig);
                const retryData = await retryResponse.json();
                
                if (!retryResponse.ok) {
                  throw new Error(retryData.message || retryData.detail || retryData.error || 'Request failed after token refresh');
                }
                
                return retryData;
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          
          // If refresh failed or no refresh token, clear auth data but don't redirect
          console.log('Token refresh failed, clearing auth data...');
          this.clearAuthData();
          
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.detail || data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  isAuthEndpoint(endpoint) {
    return endpoint.startsWith('/auth/') || endpoint.includes('login') || endpoint.includes('signup');
  }

  getMockResponse(endpoint, body) {
    switch (endpoint) {
      case '/property/analyze/':
        return MOCK_RESPONSES.propertyData(body?.address);

      default:
        throw new Error('Endpoint not found');
    }
  }

  // Auth methods (use real backend)
  async login(email, password) {
    try {
      const response = await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ 
          username: email, // Django typically uses username field
          password 
        }),
      });
      
      // Store access and refresh tokens in localStorage
      if (response.access) {
        localStorage.setItem('token', response.access); // Use 'token' for consistency
        localStorage.setItem('access', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refresh', response.refresh);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    // Store new tokens
    if (data.access) {
      localStorage.setItem('token', data.access);
      localStorage.setItem('access', data.access);
    }
    if (data.refresh) {
      localStorage.setItem('refresh', data.refresh);
    }

    return data;
  }

  async checkTokenValidity() {
    const token = localStorage.getItem('access') || localStorage.getItem('token');
    if (!token || token === 'demo-token') {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  clearAuthData() {
    console.log('Clearing auth data...');
    localStorage.removeItem('token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('profileComplete');
    // Don't redirect automatically - let the calling code decide
  }

  async signup(userData) {
    // Create FormData to handle file uploads
    const formData = new FormData();
    
    // Basic user fields
    formData.append('username', userData.email); // Use email as username
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('first_name', userData.firstName || '');
    formData.append('last_name', userData.lastName || '');
    
    // Extended profile fields
    formData.append('phone', userData.phone || '');
    formData.append('company_name', userData.companyName || '');
    formData.append('license_number', userData.licenseNumber || '');
    formData.append('years_experience', userData.yearsExperience || '');
    formData.append('awards', userData.awards || '');
    formData.append('specialty', userData.specialty || '');
    formData.append('shortest_sale', userData.shortestSale || '');
    formData.append('highest_sale', userData.highestSale || '');
    formData.append('avg_days_on_market', userData.avgDaysOnMarket || '');
    formData.append('mission', userData.mission || '');
    formData.append('value_proposition', userData.valueProposition || '');
    formData.append('selling_style', userData.sellingStyle || '');
    formData.append('testimonial_1', userData.testimonial1 || '');
    formData.append('testimonial_2', userData.testimonial2 || '');
    formData.append('testimonial_3', userData.testimonial3 || '');
    formData.append('community_ties', userData.communityTies || '');
    
    // File uploads
    if (userData.headshot && userData.headshot instanceof File) {
      formData.append('headshot', userData.headshot);
    }
    if (userData.logo && userData.logo instanceof File) {
      formData.append('logo', userData.logo);
    }

    return this.request('/auth/register/', {
      method: 'POST',
      body: formData, // Send FormData instead of JSON
    });
  }

  // Property methods (use mock data)
  async analyzeProperty(address) {
    return this.request('/property/analyze/', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  // Payment methods (mock for now)
  async processPayment(packageId, paymentData) {
    await delay(2000);
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      message: 'Payment processed successfully'
    };
  }

  // User profile (use real backend when available)
  async getUserProfile() {
    const token = localStorage.getItem('token');
    if (!token || token === 'demo-token') {
      throw new Error('No valid token found');
    }

    return this.request('/auth/profile/', {
      method: 'GET',
    });
  }

  // Update user profile
  async updateProfile(userData) {
    // Check if we have file uploads
    const hasFileUploads = userData.headshot instanceof File || userData.logo instanceof File;
    
    if (hasFileUploads) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all text fields
      formData.append('first_name', userData.firstName || userData.first_name || '');
      formData.append('last_name', userData.lastName || userData.last_name || '');
      formData.append('email', userData.email || '');
      formData.append('phone', userData.phone || '');
      formData.append('companyName', userData.companyName || '');
      formData.append('licenseNumber', userData.licenseNumber || '');
      formData.append('yearsExperience', userData.yearsExperience || '');
      formData.append('awards', userData.awards || '');
      formData.append('specialty', userData.specialty || '');
      formData.append('shortestSale', userData.shortestSale || '');
      formData.append('highestSale', userData.highestSale || '');
      formData.append('avgDaysOnMarket', userData.avgDaysOnMarket || '');
      formData.append('mission', userData.mission || '');
      formData.append('valueProposition', userData.valueProposition || '');
      formData.append('sellingStyle', userData.sellingStyle || '');
      formData.append('testimonial1', userData.testimonial1 || '');
      formData.append('testimonial2', userData.testimonial2 || '');
      formData.append('testimonial3', userData.testimonial3 || '');
      formData.append('communityTies', userData.communityTies || '');
      
      // Add files if they exist
      if (userData.headshot instanceof File) {
        formData.append('headshot', userData.headshot);
      }
      if (userData.logo instanceof File) {
        formData.append('logo', userData.logo);
      }
      
      return this.request('/auth/profile/', {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Use JSON for text-only updates
      const profileData = {
        // Basic user fields
        first_name: userData.firstName || userData.first_name || '',
        last_name: userData.lastName || userData.last_name || '',
        email: userData.email || '',
        
        // Extended profile fields
        phone: userData.phone || '',
        companyName: userData.companyName || '',
        licenseNumber: userData.licenseNumber || '',
        yearsExperience: userData.yearsExperience || '',
        awards: userData.awards || '',
        specialty: userData.specialty || '',
        shortestSale: userData.shortestSale || '',
        highestSale: userData.highestSale || '',
        avgDaysOnMarket: userData.avgDaysOnMarket || '',
        mission: userData.mission || '',
        valueProposition: userData.valueProposition || '',
        sellingStyle: userData.sellingStyle || '',
        testimonial1: userData.testimonial1 || '',
        testimonial2: userData.testimonial2 || '',
        testimonial3: userData.testimonial3 || '',
        communityTies: userData.communityTies || '',
      };

      return this.request('/auth/profile/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    }
  }

  async generateAgentDescription() {
    try {
      const response = await this.request('/auth/generate-agent-description/', {
        method: 'POST',
      });
      return response.agent_description;
    } catch (error) {
      console.error('Error generating agent description:', error);
      return null;
    }
  }

  async perplexityAnalyze(address) {
    // First, generate the agent description
    let agentDescription = '';
    try {
      agentDescription = await this.generateAgentDescription();
    } catch (error) {
      console.warn('Failed to generate agent description, proceeding without it:', error);
    }

    const prompt = ` Create a comprehensive, data-driven real estate listing presentation for the property at ${address}.
    Use real-time web search to gather current, accurate market information.
    IMPORTANT: Format your response as clean HTML with the following structure. Do NOT use any markdown formatting, stars (*), hashes (#), or special characters. Use only clean text and the HTML structure provided:
    <div class="property-analysis">
      ${agentDescription ? `
      <section class="analysis-section" data-section="1">
        <div class="section-header">
          <h2>👋 Welcome</h2>
        </div>
        <div class="section-content">
          ${agentDescription}
        </div>
      </section>
      ` : ''}
      <section class="analysis-section" data-section="${agentDescription ? '2' : '1'}">
        <div class="section-header">
          <h2>What Buyers Love About ${address}</h2>
        </div>
        <div class="section-content">
          <p>Brief introduction paragraph about the area's appeal and key selling points.</p>
          <ul>
            <li>Specific neighborhood feature or amenity</li>
            <li>Local lifestyle benefits and community features</li>
            <li>Transportation and accessibility advantages</li>
            <li>Safety ratings and community atmosphere</li>
            <li>Recent developments or improvements</li>
            <li>Balance of urban convenience with suburban comfort</li>
          </ul>
        </div>
      </section>
      <section class="analysis-section" data-section="${agentDescription ? '3' : '2'}">
        <div class="section-header">
          <h2>Neighborhood & Proximity Highlights</h2>
        </div>
        <div class="section-content">
          <p>Here's what stands out about [specific street/area] and the surrounding area:</p>
          <ul>
            <li><strong>Lifestyle:</strong> Description of living environment and privacy</li>
            <li><strong>Local Amenities:</strong>
              <ul>
                <li>Specific nearby recreational facilities</li>
                <li>Parks, wineries, or entertainment venues</li>
              </ul>
            </li>
            <li><strong>Schools:</strong> Highly rated public schools including <strong>School Name</strong>, <strong>School Name</strong>, and <strong>School Name</strong></li>
            <li><strong>Shopping & Dining:</strong>
              <ul>
                <li>Specific shopping centers and grocery stores</li>
                <li>Popular restaurants and dining areas</li>
              </ul>
            </li>
            <li><strong>Commute Access:</strong> Transportation options and commute times to major areas</li>
          </ul>
        </div>
      </section>
      <section class="analysis-section" data-section="${agentDescription ? '4' : '3'}">
        <div class="section-header">
          <h2>Ideal Buyer Persona</h2>
        </div>
        <div class="section-content">
          <div class="subsection">
            <h3>Demographic Profile</h3>
            <ul>
              <li><strong>Age:</strong> Specific age range</li>
              <li><strong>Income:</strong> Household income range</li>
              <li><strong>Occupation:</strong> Common professional backgrounds</li>
              <li><strong>Family Status:</strong> Family composition and lifestyle stage</li>
            </ul>
          </div>
          <div class="subsection">
            <h3>Psychographic Profile</h3>
            <ul>
              <li><strong>Values:</strong> What buyers prioritize in this area</li>
              <li><strong>Lifestyle:</strong> Preferred activities and living style</li>
              <li><strong>Interests:</strong> Common hobbies and interests</li>
              <li><strong>Pain Points:</strong>
                <ul>
                  <li>Common concerns or deal-breakers</li>
                  <li>Market challenges they face</li>
                </ul>
              </li>
              <li><strong>Motivations:</strong>
                <ul>
                  <li>Primary reasons for moving to this area</li>
                  <li>Investment or lifestyle goals</li>
                </ul>
              </li>
          </ul>
          </div>
        </div>
      </section>
      <section class="analysis-section" data-section="${agentDescription ? '5' : '4'}">
        <div class="section-header">
          <h2>Market Snapshot</h2>
        </div>
        <div class="section-content">
          <div class="subsection">
            <h3>Active Listings Within 1-3 Mile Radius</h3>
            <table class="listings-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Beds</th>
                  <th>Baths</th>
                  <th>Sqft</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>123 Example Street</td>
                  <td>3</td>
                  <td>2</td>
                  <td>1,850</td>
                  <td>$750,000</td>
                </tr>
                <tr>
                  <td>456 Sample Avenue</td>
                  <td>4</td>
                  <td>3</td>
                  <td>2,200</td>
                  <td>$895,000</td>
                </tr>
                <tr>
                  <td>789 Demo Lane</td>
                  <td>2</td>
                  <td>2</td>
                  <td>1,400</td>
                  <td>$625,000</td>
                </tr>
              </tbody>
            </table>
            <p class="no-listings" style="display: none;">No active listings found within 1-3 mile radius.</p>
          </div>
          <div class="subsection">
            <h3>Pending Sales Within 1-3 Mile Radius</h3>
            <table class="listings-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Beds</th>
                  <th>Baths</th>
                  <th>Sqft</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>321 Pending Street</td>
                  <td>3</td>
                  <td>2.5</td>
                  <td>1,950</td>
                  <td>$780,000</td>
                </tr>
                <tr>
                  <td>654 Contract Avenue</td>
                  <td>4</td>
                  <td>3</td>
                  <td>2,100</td>
                  <td>$850,000</td>
                </tr>
                <tr>
                  <td>987 Escrow Lane</td>
                  <td>2</td>
                  <td>1.5</td>
                  <td>1,300</td>
                  <td>$595,000</td>
                </tr>
              </tbody>
            </table>
            <p class="no-listings" style="display: none;">No pending listings found within 1-3 mile radius.</p>
          </div>
          <div class="subsection">
            <h3>Recently Sold Within 1-3 Mile Radius</h3>
            <table class="listings-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Beds</th>
                  <th>Baths</th>
                  <th>Sqft</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>111 Sold Street</td>
                  <td>3</td>
                  <td>2</td>
                  <td>1,800</td>
                  <td>$725,000</td>
                </tr>
                <tr>
                  <td>222 Closed Avenue</td>
                  <td>4</td>
                  <td>2.5</td>
                  <td>2,000</td>
                  <td>$815,000</td>
                </tr>
                <tr>
                  <td>333 Final Lane</td>
                  <td>2</td>
                  <td>2</td>
                  <td>1,500</td>
                  <td>$650,000</td>
                </tr>
              </tbody>
            </table>
            <p class="no-listings" style="display: none;">No sold listings found within 1-3 mile radius.</p>
          </div>
          <p><strong>Average Days on Market:</strong> specific number</p>
          <p><strong>Buyer Activity:</strong> Description of market temperature and buyer behavior</p>
        </div>
      </section>
      <section class="analysis-section" data-section="${agentDescription ? '6' : '5'}">
        <div class="section-header">
          <h2>Suggested Pricing Strategy</h2>
        </div>
        <div class="section-content">
          <p><strong>Recommended List Price Range:</strong> $X,XXX,XXX - $X,XXX,XXX</p>
          <p>This price reflects:</p>
          <ul>
            <li>Active and pending competition analysis</li>
            <li>Recent sales performance in the area</li>
            <li>Strategic positioning considerations</li>
          </ul>
          <p>Additional pricing considerations and market timing advice.</p>
        </div>
      </section>
      <section class="analysis-section" data-section="${agentDescription ? '7' : '6'}">
        <div class="section-header">
          <h2>3-Week Marketing Plan</h2>
        </div>
        <div class="section-content">
          <div class="marketing-timeline">
            <div class="week">
              <h4>Week 1 - Go-To-Market Foundation</h4>
              <ul>
                <li>Professional photography and staging</li>
                <li>Digital listing preparation</li>
                <li>MLS and portal listing launch</li>
                <li>Agent outreach and pre-marketing</li>
              </ul>
            </div>
            <div class="week">
              <h4>Week 2 - Exposure & Engagement</h4>
              <ul>
                <li>Social media campaign launch</li>
                <li>Video marketing and virtual tours</li>
                <li>Email marketing to buyer database</li>
                <li>Partner agent collaboration</li>
              </ul>
            </div>
            <div class="week">
              <h4>Week 3 - Conversion & Follow-Up</h4>
              <ul>
                <li>Open houses and private showings</li>
                <li>Retargeting campaigns</li>
                <li>Feedback analysis and strategy adjustment</li>
                <li>Offer management and negotiation</li>
              </ul>
            </div>
          </div>
          <p><em>Disclaimer: Market activity and timing may vary. All campaigns are adjusted based on feedback, showings, and buyer behavior.</em></p>
        </div>
      </section>
      <section class="analysis-section" data-section="${agentDescription ? '8' : '7'}">
        <div class="section-header">
          <h2>Local Market Report</h2>
        </div>
        <div class="section-content">
          <ul>
            <li><strong>Inventory Level:</strong> X.X months (Market condition description)</li>
            <li><strong>Buyer Pool:</strong> Description of buyer activity and motivations</li>
            <li><strong>List-to-Sale Ratio:</strong> Percentage and market implications</li>
            <li><strong>Demand:</strong> Current demand patterns and buyer preferences</li>
          </ul>
          <p>Market summary and outlook for the area.</p>
        </div>
      </section>
      <section class="analysis-section" data-section="${agentDescription ? '9' : '8'}">
        <div class="section-header">
          <h2>Selling Timeline Overview</h2>
        </div>
        <div class="section-content">
          <p>From preparation to closing:</p>
          <ol>
            <li><strong>Pre-Market Setup:</strong> Photography, staging recommendations, property prep</li>
            <li><strong>Live on Market:</strong> Syndication + agent promotion</li>
            <li><strong>Showings:</strong> Weekend and weekday showings with feedback</li>
            <li><strong>Offers:</strong> Reviewed and negotiated</li>
            <li><strong>Under Contract:</strong> Inspections, appraisal, and title</li>
            <li><strong>Closing:</strong> Final walkthrough and celebration</li>
          </ol>
          <p>You'll receive clear expectations, weekly progress updates, and full transparency every step of the way.</p>
        </div>
      </section>
    </div>
    CRITICAL INSTRUCTIONS:
    1. Replace ALL template content with REAL, CURRENT data about ${address}
    2. Search the web for current, real-time information about this specific address and surrounding area
    3. Include specific data points, recent sales figures, current listings, and up-to-date market conditions
    4. Use the exact HTML structure provided above
    5. Fill each section with actual researched data, not generic advice
    6. Keep all HTML tags exactly as shown
    7. Focus on actionable, location-specific information that reflects today's market reality
    8. Do NOT use any markdown formatting, stars (*), hashes (#), or special characters
    9. Use only clean text, HTML tags, and <strong> tags for emphasis
    10. Ensure all data is current and location-specific
    11. Include real addresses, school names, and specific local amenities
    12. Provide actual price ranges and market data
    13. CRITICAL: For Market Snapshot sections (Active Listings, Pending Sales, Recently Sold), ONLY include actual properties found within 1-3 mile radius. If no properties are found for any section, hide the table and show the "No listings found" message by changing the table style to "display: none;" and the .no-listings paragraph style to "display: block;"
    14. Use the exact table structure provided with Address|Beds|Baths|Sqft|Price columns
    15. Fill tables with real property data when available, ensuring all data is current and location-specific
    16. ONLY show positive, factual information that was actually discovered through research
    `;

    // Use the API base URL configuration
    const response = await fetch(`${API_BASE_URL}/auth/perplexity/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add authorization header if available
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Perplexity API error: ${response.status}`);
    }
    
    return response.json();
  }

  // Property Analysis methods
  async savePropertyAnalysis(analysisData) {
    const response = await fetch(`${API_BASE_URL}/auth/analyses/save/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify(analysisData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error saving analysis: ${response.status}`);
    }
    
    return response.json();
  }

  async getRecentAnalyses() {
    const response = await fetch(`${API_BASE_URL}/auth/analyses/recent/`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error fetching recent analyses: ${response.status}`);
    }
    
    return response.json();
  }

  async getPropertyAnalysis(analysisId) {
    const response = await fetch(`${API_BASE_URL}/auth/analyses/${analysisId}/`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error fetching analysis: ${response.status}`);
    }
    
    return response.json();
  }

  async deletePropertyAnalysis(analysisId) {
    const response = await fetch(`${API_BASE_URL}/auth/analyses/${analysisId}/delete/`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error deleting analysis: ${response.status}`);
    }
    
    return response.json();
  }

  async updatePropertyAnalysis(analysisId, updatedContent) {
    const response = await fetch(`${API_BASE_URL}/auth/analyses/${analysisId}/update/`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify({ analysis_content: updatedContent }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error updating analysis: ${response.status}`);
    }
    
    return response.json();
  }

  // Stripe Payment methods
  async createPaymentIntent(paymentData) {
    const response = await fetch(`${API_BASE_URL}/auth/payments/create-payment-intent/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error creating payment intent: ${response.status}`);
    }
    
    return response.json();
  }

  // Sharing methods
  async shareAnalysis(shareData) {
    return this.request('/auth/share/', {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  }

  async getShareStats(propertyAddress) {
    return this.request(`/auth/share/stats/?address=${encodeURIComponent(propertyAddress)}`, {
      method: 'GET',
    });
  }

  // Note: View tracking is now handled automatically in getSharedAnalysis endpoint
  // This method is kept for backward compatibility but not used
  async trackSharedView(shareLink) {
    console.log('trackSharedView called but view tracking is now handled in getSharedAnalysis');
    return { message: 'View tracking handled automatically' };
  }

  // Shared analysis methods
  async getSharedAnalysis(shareId) {
    try {
      console.log('Fetching shared analysis for shareId:', shareId);
      const response = await fetch(`${API_BASE_URL}/auth/shared/${shareId}/`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Shared analysis response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Shared analysis error response:', errorData);
        throw new Error(errorData.error || `Error fetching shared analysis: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Shared analysis data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching shared analysis:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const api = new API();

// Export notification utility
export const showNotification = (message, type = 'success', duration = 3000) => {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  notification.className = `fixed top-4 left-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 transform -translate-x-full transition-transform duration-300`;
  notification.innerHTML = `
    <div class="flex-shrink-0">
      ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
    </div>
    <div class="font-medium">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('-translate-x-full');
  }, 100);
  
  // Animate out and remove
  setTimeout(() => {
    notification.classList.add('-translate-x-full');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, duration);
};

export default api;