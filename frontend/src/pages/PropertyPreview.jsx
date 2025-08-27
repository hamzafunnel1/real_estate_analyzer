import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Download, 
  Share2, 
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Building,
  User,
  Phone,
  Mail
} from 'lucide-react';

// Add html2pdf.js for PDF export
// You may need to install it: npm install html2pdf.js
import html2pdf from 'html2pdf.js';
import ShareModal from '../components/ShareModal';
import EditableContent from '../components/EditableContent';

const BACKEND_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'https://real-estate-api-ejqg.onrender.com';

// Helper function to get the full image URL
function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/media/')) return `${BACKEND_URL}${path}`;
  if (path.startsWith('media/')) return `${BACKEND_URL}/${path}`;
  return path;
}

const PropertyPreview = ({ property, onStartOver, user, perplexityResult, perplexityAddress }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const contentRef = useRef(null);

  // Create a property object if we only have Perplexity data
  const effectiveProperty = property || (perplexityResult ? { 
    address: perplexityAddress || 'Property Address', 
    package: { id: 'premium', name: 'Professional' } 
  } : null);

  useEffect(() => {
    if (effectiveProperty && perplexityResult) {
      setIsGenerating(false);
    } else if (effectiveProperty) {
      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
    }
  }, [effectiveProperty, perplexityResult]);

  // Handle saving edited content
  const handleSaveContent = async (updatedContent) => {
    if (!currentAnalysisId) {
      console.error('No analysis ID available for saving');
      return;
    }

    try {
      const { api, showNotification } = await import('../utils/api');
      await api.updatePropertyAnalysis(currentAnalysisId, updatedContent);
      showNotification('Analysis updated successfully!', 'success');
      
      // Update the perplexity result with new content
      if (perplexityResult && perplexityResult.choices && perplexityResult.choices[0]) {
        perplexityResult.choices[0].message.content = updatedContent;
      }
    } catch (error) {
      console.error('Error saving content:', error);
      const { showNotification } = await import('../utils/api');
      showNotification('Failed to save changes. Please try again.', 'error');
      throw error;
    }
  };

  // Try to get the analysis ID from the current analysis
  useEffect(() => {
    const getAnalysisId = async () => {
      if (effectiveProperty?.address && user) {
        try {
          const { api } = await import('../utils/api');
          const recentAnalyses = await api.getRecentAnalyses();
          const matchingAnalysis = recentAnalyses.analyses?.find(
            analysis => analysis.address === effectiveProperty.address
          );
          if (matchingAnalysis) {
            setCurrentAnalysisId(matchingAnalysis.id);
          }
        } catch (error) {
          console.log('Could not fetch analysis ID:', error);
        }
      }
    };
    
    getAnalysisId();
  }, [effectiveProperty?.address, user]);

  // Helper to get headshot and logo from analysis or user
  function getAnalysisImage(field) {
    // Try perplexityResult (API response), then property, then user
    if (perplexityResult && perplexityResult.headshot && field === 'headshot') return perplexityResult.headshot;
    if (perplexityResult && perplexityResult.logo && field === 'logo') return perplexityResult.logo;
    if (property && property.headshot && field === 'headshot') return property.headshot;
    if (property && property.logo && field === 'logo') return property.logo;
    if (user?.profile?.[field]) return user.profile[field];
    if (user?.[field]) return user[field];
    return null;
  }

  // PDF Download Handler
  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin:       0.75,
      filename:     `${effectiveProperty.address.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak:    { 
        mode: ['avoid-all', 'css', 'legacy']
      }
    };
    
    // Add PDF-specific styles before generating - REMOVE ALL BORDERS AND LINES
    const pdfStyles = document.createElement('style');
    pdfStyles.innerHTML = `
      @media print {
        * {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }

        .property-analysis-content .section-header {
          margin-bottom: 2rem !important;
          padding-bottom: 1rem !important;
          border-bottom: none !important;
          page-break-after: avoid !important;
        }
        .property-analysis-content .section-header h2 {
          margin-bottom: 0.5rem !important;
          line-height: 1.4 !important;
          word-wrap: break-word !important;
          border: none !important;
        }
        .property-analysis-content .section-content {
          margin-top: 1rem !important;
          page-break-inside: avoid !important;
          border: none !important;
        }
        .property-analysis-content ul li {
          margin-bottom: 0.75rem !important;
          line-height: 1.8 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          border: none !important;
        }
        .property-analysis-content p {
          margin-bottom: 1.25rem !important;
          line-height: 1.8 !important;
          word-wrap: break-word !important;
          border: none !important;
        }
        .property-analysis-content .analysis-section {
          margin-bottom: 3.5rem !important;
          page-break-inside: avoid !important;
          border: none !important;
        }
        .property-analysis-content .marketing-timeline .week {
          margin-bottom: 1.5rem !important;
          page-break-inside: avoid !important;
          border: none !important;
          background: transparent !important;
        }
        .property-analysis-content strong {
          font-weight: 700 !important;
          border: none !important;
        }
        .property-analysis-content h3 {
          border: none !important;
        }
        .property-analysis-content .subsection h3 {
          border: none !important;
        }
        /* Remove all container borders */
        .bg-white, .rounded-lg, .shadow-sm, .border {
          border: none !important;
          box-shadow: none !important;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(pdfStyles);

    // Remove padding classes and border classes before PDF export
    const originalClass = element.className;
    element.className = originalClass.replace(/p-8|md:p-12|border|border-gray-200|shadow-sm|rounded-lg/g, '');

    setTimeout(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        element.className = originalClass;
        document.head.removeChild(pdfStyles);
      }).catch((error) => {
        element.className = originalClass;
        document.head.removeChild(pdfStyles);
      });
    }, 300);
  };

  if (!effectiveProperty) return null;

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Report</h2>
            <p className="text-gray-600">Please wait while we analyze your property...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              {/* Logo on the left */}
              {user?.profile?.logo || user?.logo ? (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img 
                    src={getImageUrl(user.profile?.logo || user.logo)} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}}>
                  <Home className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight truncate md:whitespace-nowrap md:truncate max-w-full md:max-w-[28rem]" title={effectiveProperty.address}>
                  {effectiveProperty.address}
                </h1>
                <p className="text-gray-600 font-medium">Property Analysis Report</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Headshot on the right */}
              {user?.profile?.headshot || user?.headshot ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={getImageUrl(user.profile?.headshot || user.headshot)} 
                    alt="Agent Headshot" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              <button
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 text-white font-medium transition-colors" 
                style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)', borderRadius: '10px'}} 
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0052A3 0%, #00A3D6 100%)'} 
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}
              >
                <Share2 className="w-4 h-4 inline mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - PDF Style */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div ref={contentRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Professional Agent Header with Logo and Headshot */}
          {(getAnalysisImage('logo') || getAnalysisImage('headshot')) && (
            <div className="flex justify-between items-center mb-12 pb-8 border-b-2 border-gray-100">
              {/* Logo on the left */}
              {getAnalysisImage('logo') ? (
                <div className="w-28 h-28 rounded-xl overflow-hidden shadow-lg border-2 border-gray-100">
                  <img 
                    src={getImageUrl(getAnalysisImage('logo'))} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-gray-100 shadow-lg">
                  <Building className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Center divider */}
              <div className="flex-1 mx-8">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              </div>
              
              {/* Headshot on the right */}
              {getAnalysisImage('headshot') ? (
                <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white ring-2 ring-gray-100">
                  <img 
                    src={getImageUrl(getAnalysisImage('headshot'))} 
                    alt="Agent Headshot" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 border-4 border-white ring-2 ring-gray-100 shadow-lg">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          )}
          
          {perplexityResult && perplexityResult.choices && perplexityResult.choices[0]?.message?.content ? (
            <EditableContent
              content={perplexityResult.choices[0].message.content}
              onSave={handleSaveContent}
              isEditing={isEditing}
              onToggleEdit={setIsEditing}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Available</h3>
              <p className="text-gray-600 mb-6">Please generate a new property analysis to view detailed insights.</p>
              <button
                onClick={onStartOver}
                className="px-6 py-3 text-white font-medium transition-colors"
                style={{background: 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)', borderRadius: '10px'}}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #4A32CC 0%, #00A3D6 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)'}
              >
                Start New Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced CSS for clean, modern PDF-style layout */}
      <style jsx>{`
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .property-analysis-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1f2937;
          line-height: 1.6;
        }
        .property-analysis-content .analysis-section {
          margin-bottom: 3rem;
        }
        .property-analysis-content .section-header {
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
        }
        .property-analysis-content .section-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          letter-spacing: -0.025em;
          line-height: 1.3;
          word-wrap: break-word;
        }
        .property-analysis-content .section-header h2:before {
          content: '';
          width: 4px;
          height: 24px;
          background: linear-gradient(90deg, #0066CC 0%, #00C4FF 100%);
          border-radius: 2px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .property-analysis-content .analysis-section[data-section="1"] .section-header h2:before { content: '🌟'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="2"] .section-header h2:before { content: '📍'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="3"] .section-header h2:before { content: '🎯'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="4"] .section-header h2:before { content: '📊'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="5"] .section-header h2:before { content: '💰'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="6"] .section-header h2:before { content: '🔥'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="7"] .section-header h2:before { content: '📈'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="8"] .section-header h2:before { content: '⏰'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .section-content {
          color: #374151;
          font-size: 1rem;
          line-height: 1.7;
        }
        .property-analysis-content .section-content p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }
        .property-analysis-content .section-content ul {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        .property-analysis-content .section-content li {
          margin-bottom: 0.75rem;
          line-height: 1.7;
          position: relative;
        }
        .property-analysis-content .section-content li:before {
          content: '';
          position: absolute;
          left: -1.25rem;
          top: 0.5rem;
          width: 6px;
          height: 6px;
          background: linear-gradient(90deg, #0066CC 0%, #00C4FF 100%);
          border-radius: 50%;
        }
        .property-analysis-content .section-content strong {
          font-weight: 700;
          color: #111827;
        }
        .property-analysis-content .subsection {
          margin-top: 2rem;
          padding-left: 1rem;
          border-left: 2px solid #e5e7eb;
        }
        .property-analysis-content .subsection h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }
        .property-analysis-content .marketing-timeline {
          margin: 2rem 0;
        }
        .property-analysis-content .marketing-timeline .week {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          position: relative;
        }
        .property-analysis-content .marketing-timeline .week h4 {
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
          font-size: 1.125rem;
          line-height: 1.4;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .property-analysis-content .marketing-timeline .week ul {
          margin: 0;
          padding-left: 1.25rem;
          list-style: none;
        }
        .property-analysis-content .marketing-timeline .week li {
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #374151;
          position: relative;
          padding-left: 1.5rem;
        }
        .property-analysis-content .marketing-timeline .week li:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.5rem;
          width: 6px;
          height: 6px;
          background: linear-gradient(90deg, #0066CC 0%, #00C4FF 100%);
          border-radius: 50%;
        }
        
        /* Table styles for listings */
        .property-analysis-content .listings-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0 1.5rem 0;
          font-size: 0.95rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .property-analysis-content .listings-table thead {
          background: linear-gradient(90deg, #0066CC 0%, #00C4FF 100%);
          color: white;
        }
        .property-analysis-content .listings-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.025em;
        }
        .property-analysis-content .listings-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        .property-analysis-content .listings-table tbody tr:hover {
          background-color: #f9fafb;
        }
        .property-analysis-content .listings-table tbody tr:last-child td {
          border-bottom: none;
        }
        .property-analysis-content .listings-table th:first-child {
          font-weight: 600;
          color: white;
        }
        .property-analysis-content .listings-table td:first-child {
          font-weight: 600;
          color: #111827;
        }
        .property-analysis-content .listings-table th:last-child,
        .property-analysis-content .listings-table td:last-child {
          text-align: right;
          font-weight: 600;
        }
        .property-analysis-content .no-listings {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 8px;
          margin: 1rem 0;
        }
        
        @media (max-width: 768px) {
          .property-analysis-content .section-header h2 { font-size: 1.25rem; }
          .property-analysis-content .section-header h2:before { font-size: 1.25rem; margin-right: 0.5rem; }
          .property-analysis-content .marketing-timeline .week { padding: 1rem; }
          .property-analysis-content ul li { padding-left: 1.25rem; }
        }
        /* Address truncation for long addresses in header */
        .truncate, .max-w-full, .md\:max-w-\[28rem\] {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        propertyAddress={effectiveProperty.address}
        analysisContent={perplexityResult?.choices?.[0]?.message?.content || ''}
        user={user}
      />
    </div>
  );
};

export default PropertyPreview;