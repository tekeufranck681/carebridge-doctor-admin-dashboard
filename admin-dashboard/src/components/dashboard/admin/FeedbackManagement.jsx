import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, AlertTriangle, ThumbsUp, ThumbsDown, Minus, Eye, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { useFeedbackStore } from '../../../stores/feedbackStore';
import { SEOHead } from '../../SEO/SEOHead';

export const FeedbackManagement = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  // Add state to track view counts for each feedback with localStorage persistence
  const [viewCounts, setViewCounts] = useState(() => {
    try {
      const stored = localStorage.getItem('carebridge-feedback-view-counts');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load view counts from localStorage:', error);
      return {};
    }
  });

  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const { 
    feedbacks, 
    fetchFeedbacks, 
    deleteFeedback,
    isLoading, 
    error,
    clearError 
  } = useFeedbackStore();

  // Helper function to save view counts to localStorage
  const saveViewCountsToStorage = (counts) => {
    try {
      const dataToStore = {
        counts,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem('carebridge-feedback-view-counts', JSON.stringify(dataToStore));
    } catch (error) {
      console.warn('Failed to save view counts to localStorage:', error);
    }
  };

  // Helper function to load view counts from localStorage
  const loadViewCountsFromStorage = () => {
    try {
      const stored = localStorage.getItem('carebridge-feedback-view-counts');
      if (!stored) return {};
      
      const data = JSON.parse(stored);
      
      // Handle both old format (direct object) and new format (with metadata)
      if (data.counts && data.version) {
        return data.counts;
      } else if (typeof data === 'object' && data !== null) {
        // Legacy format - migrate to new format
        saveViewCountsToStorage(data);
        return data;
      }
      
      return {};
    } catch (error) {
      console.warn('Failed to load view counts from localStorage:', error);
      return {};
    }
  };

  // Helper function to clean up old entries from localStorage
  const cleanupOldEntries = (currentFeedbackIds) => {
    try {
      const currentCounts = loadViewCountsFromStorage();
      const cleanedCounts = {};
      
      // Only keep counts for feedbacks that still exist
      currentFeedbackIds.forEach(id => {
        if (currentCounts[id]) {
          cleanedCounts[id] = currentCounts[id];
        }
      });
      
      // Save cleaned data back to storage
      saveViewCountsToStorage(cleanedCounts);
      return cleanedCounts;
    } catch (error) {
      console.warn('Failed to cleanup old entries:', error);
      return loadViewCountsFromStorage();
    }
  };

  // Load feedbacks on component mount
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        await fetchFeedbacks();
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to load feedbacks'
        });
      }
    };

    loadFeedbacks();
  }, [fetchFeedbacks, showToast]);

  // Sync viewCounts with localStorage and cleanup old entries when feedbacks change
  useEffect(() => {
    if (feedbacks.length > 0) {
      const currentFeedbackIds = feedbacks.map(f => f.id);
      const cleanedCounts = cleanupOldEntries(currentFeedbackIds);
      
      // Update state if cleanup changed the data
      setViewCounts(prevCounts => {
        const hasChanges = JSON.stringify(prevCounts) !== JSON.stringify(cleanedCounts);
        return hasChanges ? cleanedCounts : prevCounts;
      });
    }
  }, [feedbacks]);

  // Transform backend data to match UI expectations
  const transformedFeedbacks = feedbacks.map(feedback => {
    const viewCount = viewCounts[feedback.id] || 0;
    const status = viewCount >= 1 ? 'read' : 'unread';
    
    return {
      id: feedback.id,
      category: feedback.urgent ? 'urgent' : feedback.sentiment || 'neutral',
      title: `Feedback from Patient ${feedback.patient_id?.substring(0, 8) || 'Unknown'}`,
      message: feedback.feedback_text || 'No feedback text available',
      patientId: feedback.patient_id,
      topics: Array.isArray(feedback.topics) ? feedback.topics : (feedback.topics ? feedback.topics.split(',').map(t => t.trim()) : []),
      date: feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'Unknown',
      status: status, // Dynamic status based on view count
      urgent: feedback.urgent || false,
      sentiment: feedback.sentiment,
      viewCount: viewCount
    };
  });

  const filteredFeedback = transformedFeedbacks.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      case 'positive': return <ThumbsUp className="w-5 h-5" />;
      case 'negative': return <ThumbsDown className="w-5 h-5" />;
      case 'neutral': return <Minus className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'negative': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'neutral': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'read': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const categoryTabs = [
    { id: 'all', label: 'All', count: transformedFeedbacks.length },
    { id: 'urgent', label: 'Urgent', count: transformedFeedbacks.filter(f => f.category === 'urgent').length },
    { id: 'positive', label: 'Positive', count: transformedFeedbacks.filter(f => f.category === 'positive').length },
    { id: 'negative', label: 'Negative', count: transformedFeedbacks.filter(f => f.category === 'negative').length },
    { id: 'neutral', label: 'Neutral', count: transformedFeedbacks.filter(f => f.category === 'neutral').length }
  ];

  const handleViewFeedback = (feedbackItem) => {
    // Increment view count for this feedback
    const newViewCounts = {
      ...viewCounts,
      [feedbackItem.id]: (viewCounts[feedbackItem.id] || 0) + 1
    };
    
    setViewCounts(newViewCounts);
    
    // Save to localStorage
    saveViewCountsToStorage(newViewCounts);

    setSelectedFeedback(feedbackItem);
    setShowViewModal(true);
  };

  const handleDeleteClick = (feedbackItem) => {
    setFeedbackToDelete(feedbackItem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;

    try {
      await deleteFeedback(feedbackToDelete.id);
      
      // Remove view count for deleted feedback from both state and localStorage
      const newViewCounts = { ...viewCounts };
      delete newViewCounts[feedbackToDelete.id];
      
      setViewCounts(newViewCounts);
      saveViewCountsToStorage(newViewCounts);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Feedback deleted successfully'
      });
      setShowDeleteModal(false);
      setFeedbackToDelete(null);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete feedback'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="mt-3 text-gray-600 dark:text-gray-400">
          Loading feedbacks...
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.feedback')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and analyze patient feedback
          </p>
        </motion.div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 dark:text-red-400 mb-4">
                Error loading feedbacks: {error}
              </p>
              <Button 
                onClick={() => {
                  clearError();
                  fetchFeedbacks();
                }} 
                variant="primary"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Feedback Management"
        description="Analyze and manage patient feedback in CareBridge healthcare system. Review urgent feedback, sentiment analysis, and patient satisfaction metrics."
        keywords="patient feedback, healthcare feedback analysis, patient satisfaction, sentiment analysis, urgent feedback, healthcare quality management"
        ogTitle="Feedback Management - CareBridge Healthcare Analytics"
        ogDescription="Advanced patient feedback management and analysis system for healthcare quality improvement"
      />
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.feedback')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and analyze patient feedback
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-2 mb-6">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2
                  ${activeCategory === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                {tab.label}
                <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feedback List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-4"
        >
          {filteredFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No feedback found for the selected category.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredFeedback.map((feedbackItem) => (
              <Card key={feedbackItem.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${getCategoryColor(feedbackItem.category)}`}>
                        {getCategoryIcon(feedbackItem.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {feedbackItem.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedbackItem.status)}`}>
                            {feedbackItem.status}
                          </span>
                          {feedbackItem.urgent && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {feedbackItem.message}
                        </p>
                        {feedbackItem.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {feedbackItem.topics.slice(0, 3).map((topic, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                            {feedbackItem.topics.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                +{feedbackItem.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>Patient ID: {feedbackItem.patientId?.substring(0, 8) || 'Unknown'}</span>
                          <span>Date: {feedbackItem.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewFeedback(feedbackItem)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(feedbackItem)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>

        {/* View Feedback Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Feedback Details"
          size="lg"
        >
          {selectedFeedback && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getCategoryColor(selectedFeedback.category)}`}>
                  {getCategoryIcon(selectedFeedback.category)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedFeedback.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedFeedback.status)}`}>
                      {selectedFeedback.status}
                    </span>
                    {selectedFeedback.urgent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Feedback Text</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedFeedback.message}
                </p>
              </div>

              {selectedFeedback.topics.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeedback.topics.map((topic, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Patient ID
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedFeedback.patientId || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sentiment
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedFeedback.sentiment || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedFeedback.date}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Feedback"
          size="sm"
        >
          {feedbackToDelete && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this feedback? This action cannot be undone.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Feedback:</strong> {feedbackToDelete.message.substring(0, 100)}...
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleDeleteConfirm}
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                  loading={isLoading}
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="secondary"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};
