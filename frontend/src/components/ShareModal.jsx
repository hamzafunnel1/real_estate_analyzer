import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Share2, 
  Send, 
  Copy, 
  Check,
  Eye,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';

const ShareModal = ({ isOpen, onClose, propertyAddress, analysisContent, user }) => {
  const [email, setEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareStats, setShareStats] = useState({
    totalShares: 0,
    totalViews: 0,
    emailStats: []
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate shareable link with a unique share ID
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const shareId = btoa(encodeURIComponent(propertyAddress + timestamp + randomString)).substring(0, 16);
      const shareLink = `${window.location.origin}/shared/${shareId}`;
      setShareLink(shareLink);
      
      // Don't create share record yet - only when user actually copies the link
      // createShareRecord(shareLink);
      
      // Load share stats
      loadShareStats();
      
      // Set default message
      setShareMessage(`Hi! I'd like to share this property analysis for ${propertyAddress} with you. This comprehensive report provides valuable insights about the property and market conditions.`);
    }
  }, [isOpen, propertyAddress]);

  const createShareRecord = async (shareLink) => {
    try {
      const { api } = await import('../utils/api');
      
      const shareData = {
        email: 'link-share', // Special identifier for link sharing
        propertyAddress,
        analysisContent,
        shareMessage: `Property analysis for ${propertyAddress} shared via link`,
        shareLink,
        sharedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown User'
      };

      await api.shareAnalysis(shareData);
      console.log('Share record created successfully:', shareLink);
      
      // Store the share link in localStorage so it can be accessed even if record creation fails
      const pendingShares = JSON.parse(localStorage.getItem('pendingShares') || '[]');
      pendingShares.push({
        shareLink,
        propertyAddress,
        timestamp: Date.now()
      });
      localStorage.setItem('pendingShares', JSON.stringify(pendingShares));
      
    } catch (error) {
      console.error('Error creating share record:', error);
      // Don't throw error - we still want to show the share modal
    }
  };

  const loadShareStats = async () => {
    try {
      const { api } = await import('../utils/api');
      const stats = await api.getShareStats(propertyAddress);
      setShareStats(stats);
    } catch (error) {
      console.error('Error loading share stats:', error);
    }
  };

  const handleShare = async () => {
    if (!email.trim()) return;

    setIsSharing(true);
    try {
      const { api, showNotification } = await import('../utils/api');
      
      const shareData = {
        email: email.trim(),
        propertyAddress,
        analysisContent,
        shareMessage: shareMessage.trim(),
        shareLink,
        sharedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown User'
      };

      await api.shareAnalysis(shareData);
      
      showNotification('Analysis shared successfully!', 'success');
      
      // Reload stats
      await loadShareStats();
      
      // Reset form
      setEmail('');
      setShareMessage(`Hi! I'd like to share this property analysis for ${propertyAddress} with you. This comprehensive report provides valuable insights about the property and market conditions.`);
      
    } catch (error) {
      console.error('Error sharing analysis:', error);
      const { showNotification } = await import('../utils/api');
      showNotification(error.message || 'Failed to share analysis. Please try again.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      
      // Create share record when link is actually copied
      await createShareRecord(shareLink);
      
      // Reload stats to show the new share
      await loadShareStats();
      
      const { showNotification } = await import('../utils/api');
      showNotification('Link copied to clipboard! Share recorded.', 'success');
    } catch (error) {
      console.error('Error copying link:', error);
      const { showNotification } = await import('../utils/api');
      showNotification('Link copied but failed to record share.', 'warning');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

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
          className="card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 theme-border-secondary border-b">
            <div className="flex items-center space-x-3">
              <Share2 className="w-6 h-6 theme-text-primary" />
              <div>
                <h2 className="text-xl font-bold theme-text-primary">Share Analysis</h2>
                <p className="text-sm theme-text-muted">{propertyAddress}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="theme-text-muted hover:theme-text-primary transition-colors p-2 hover:theme-bg-tertiary rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Share Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <Users className="w-6 h-6 theme-text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold theme-text-primary">{shareStats.totalShares}</div>
                <div className="text-sm theme-text-muted">Total Shares</div>
              </div>
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <Eye className="w-6 h-6 theme-text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold theme-text-primary">{shareStats.totalViews}</div>
                <div className="text-sm theme-text-muted">Total Views</div>
              </div>
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <Calendar className="w-6 h-6 theme-text-muted mx-auto mb-2" />
                <div className="text-2xl font-bold theme-text-primary">{shareStats.emailStats.length}</div>
                <div className="text-sm theme-text-muted">Unique Recipients</div>
              </div>
            </div>

            {/* Share Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Shared by: {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown User'}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Recipient Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="recipient@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Personal Message
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Add a personal message..."
                />
              </div>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="block text-sm font-medium theme-text-primary">
                Shareable Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="form-input flex-1 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{linkCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Previous Shares */}
            {shareStats.emailStats.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium theme-text-primary">Previous Shares</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {shareStats.emailStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 theme-bg-secondary rounded-lg">
                      <div>
                        <div className="text-sm font-medium theme-text-primary">{stat.email}</div>
                        <div className="text-xs theme-text-muted">
                          Shared on {formatDate(stat.lastShared)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium theme-text-primary">{stat.views} views</div>
                        <div className="text-xs theme-text-muted">{stat.shares} shares</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 theme-bg-primary theme-border-secondary border-t flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 theme-border-secondary border theme-text-secondary rounded-lg hover:theme-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!email.trim() || isSharing}
              className="disabled:opacity-50 theme-text-primary px-6 py-2 font-medium transition-colors flex items-center space-x-2"
                              style={{background: 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)', borderRadius: '10px'}}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0052A3 0%, #00A3D6 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #0066CC 0%, #00C4FF 100%)'}
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Share Analysis</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal; 