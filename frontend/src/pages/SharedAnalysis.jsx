import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Download, 
  FileText,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { api } from '../utils/api';

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

const SharedAnalysis = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingComplete, setTrackingComplete] = useState(false);
  const contentRef = React.useRef(null);

  useEffect(() => {
    const fetchSharedAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching shared analysis for shareId:', shareId);
        
        // Fetch the shared analysis data (this already tracks the view)
        const response = await api.getSharedAnalysis(shareId);
        console.log('Shared analysis response:', response);
        setAnalysis(response);
        
        // View is already tracked in getSharedAnalysis, no need to track again
        setTrackingComplete(true);
        
      } catch (err) {
        console.error('Error fetching shared analysis:', err);
        setError(err.message || 'Failed to load shared analysis');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedAnalysis();
    }
  }, [shareId]);

  // PDF Download Handler
  const handleDownloadPDF = () => {
    if (!analysis || !contentRef.current) return;
    
    const element = contentRef.current;
    const opt = {
      margin: 0.75,
      filename: `${analysis.address.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy']
      }
    };
    
    // Add PDF-specific styles before generating
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
        .bg-white, .rounded-lg, .shadow-sm, .border {
          border: none !important;
          box-shadow: none !important;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(pdfStyles);

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



  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Analysis</h2>
            <p className="text-gray-600">Please wait while we load the shared property analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 text-white font-medium transition-colors"
              style={{background: 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)', borderRadius: '10px'}}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #4A32CC 0%, #00A3D6 100%)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)'}
            >
              Go to Homepage
            </button>
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
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)'}}>
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight truncate md:whitespace-nowrap md:truncate max-w-full md:max-w-[28rem]" title={analysis.address}>
                  {analysis.address}
                </h1>
                <p className="text-gray-600 font-medium">Shared Property Analysis Report</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </button>
              <button
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - PDF Style */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div ref={contentRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          {analysis.content ? (
            <div 
              className="property-analysis-content"
              dangerouslySetInnerHTML={{ 
                __html: analysis.content 
              }}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Available</h3>
              <p className="text-gray-600 mb-6">The analysis content could not be loaded.</p>
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
          display: inline-block;
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.75rem;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        .property-analysis-content .analysis-section[data-section="1"] .section-header h2:before { content: '🌟'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="2"] .section-header h2:before { content: '📍'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="3"] .section-header h2:before { content: '🎯'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="4"] .section-header h2:before { content: '📊'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="5"] .section-header h2:before { content: '💰'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="6"] .section-header h2:before { content: '🔥'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="7"] .section-header h2:before { content: '📈'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .analysis-section[data-section="8"] .section-header h2:before { content: '⏰'; width: auto; height: auto; font-size: 1.5rem; }
        .property-analysis-content .section-content { color: #374151; }
        .property-analysis-content p { margin-bottom: 1rem; font-size: 1rem; line-height: 1.7; }
        .property-analysis-content h3 { font-size: 1.125rem; font-weight: 700; color: #111827; margin: 1.5rem 0 0.75rem 0; }
        .property-analysis-content strong { font-weight: 600; color: #111827; }
        .property-analysis-content ul { list-style: none; padding-left: 0; margin-bottom: 1.5rem; }
        .property-analysis-content ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.5rem; font-size: 1rem; line-height: 1.6; }
        .property-analysis-content ul li:before { content: ''; position: absolute; left: 0.25rem; top: 0.65rem; width: 0.5rem; height: 0.5rem; background: #3b82f6; border-radius: 50%; }
        .property-analysis-content ul ul { margin-top: 0.5rem; margin-bottom: 0.5rem; padding-left: 1rem; }
        .property-analysis-content ul ul li:before { width: 0.375rem; height: 0.375rem; background: #93c5fd; top: 0.7rem; }
        .property-analysis-content ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .property-analysis-content ol li { margin-bottom: 0.5rem; font-size: 1rem; line-height: 1.6; }
        .property-analysis-content .subsection { margin-bottom: 2rem; }
        .property-analysis-content .subsection h3 { 
          font-size: 1.125rem; 
          font-weight: 700; 
          color: #111827; 
          margin-bottom: 0.75rem; 
          padding-bottom: 0.25rem; 
        }
        .property-analysis-content .marketing-timeline { 
          margin: 2rem 0; 
        }
        .property-analysis-content .marketing-timeline .week { 
          background: #f8fafc; 
          border: 1px solid #e2e8f0;
          padding: 1.5rem; 
          border-radius: 8px; 
          margin-bottom: 1rem;
          position: relative;
        }
        .property-analysis-content .marketing-timeline .week h4 { 
          margin: 0 0 1rem 0; 
          font-size: 1.125rem; 
          font-weight: 700; 
          color: #111827; 
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
          line-height: 1.4;
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
        .property-analysis-content em { font-style: italic; color: #6b7280; font-size: 0.9rem; }
        @media (max-width: 768px) {
          .property-analysis-content .section-header h2 { font-size: 1.25rem; }
          .property-analysis-content .section-header h2:before { font-size: 1.25rem; margin-right: 0.5rem; }
          .property-analysis-content .marketing-timeline .week { padding: 1rem; }
          .property-analysis-content ul li { padding-left: 1.25rem; }
        }
        .truncate, .max-w-full, .md\:max-w-\[28rem\] {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default SharedAnalysis; 