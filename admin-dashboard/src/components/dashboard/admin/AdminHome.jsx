import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, MessageSquare, AlertTriangle, Loader2, BarChart3, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { PasswordChangeNotification } from '../../ui/PasswordChangeNotification';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuthStore } from '../../../stores/authStore';
import { useUserStore } from '../../../stores/userStore';
import { useFeedbackStore } from '../../../stores/feedbackStore';
import { useToast } from '../../../contexts/ToastContext';
import { usePasswordChangeDetection } from '../../../hooks/usePasswordChangeDetection';
import { SEOHead } from '../../SEO/SEOHead';

const StatCard = ({ title, value, icon, color, delay, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card hover className="p-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {isLoading ? (
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
              ) : (
                value
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const AdminHome = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSecurityNotice, setShowSecurityNotice] = useState(() => {
    // Initialize from localStorage with user-specific key
    try {
      if (!user?.id) return true; // Show by default if no user
      const dismissalKey = `carebridge-security-notice-dismissed-${user.id}`;
      const dismissed = localStorage.getItem(dismissalKey);
      return dismissed !== 'true'; // Show notice if not dismissed
    } catch (error) {
      console.warn('Failed to read security notice dismissal from localStorage:', error);
      return true; // Show by default on error
    }
  });

  // Password change detection hook
  const { needsPasswordChange, dismissNotification } = usePasswordChangeDetection();

  // Update showSecurityNotice when user changes (e.g., different login)
  useEffect(() => {
    try {
      if (!user?.id) {
        setShowSecurityNotice(true);
        return;
      }
      
      const dismissalKey = `carebridge-security-notice-dismissed-${user.id}`;
      const dismissed = localStorage.getItem(dismissalKey);
      setShowSecurityNotice(dismissed !== 'true');
    } catch (error) {
      console.warn('Failed to read security notice dismissal from localStorage:', error);
      setShowSecurityNotice(true);
    }
  }, [user?.id]);

  // Handle security notice dismissal
  const handleSecurityNoticeDismiss = () => {
    try {
      if (user?.id) {
        const dismissalKey = `carebridge-security-notice-dismissed-${user.id}`;
        localStorage.setItem(dismissalKey, 'true');
      }
      setShowSecurityNotice(false);
    } catch (error) {
      console.warn('Failed to save security notice dismissal to localStorage:', error);
      // Still hide the notice even if localStorage fails
      setShowSecurityNotice(false);
    }
  };

  // Store hooks
  const { getAllUsers } = useUserStore();
  const { feedbacks, fetchFeedbacks, isLoading: feedbackLoading } = useFeedbackStore();

  // State for real data
  const [dashboardData, setDashboardData] = useState({
    totalDoctors: 0,
    totalAdmins: 0,
    totalFeedback: 0,
    urgentFeedback: 0,
    users: [],
    feedbackAnalytics: {
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      topTopics: [],
      urgentPercentage: 0,
      recentTrends: []
    }
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch users and feedbacks in parallel
        const [users, feedbackData] = await Promise.all([
          getAllUsers(),
          fetchFeedbacks()
        ]);

        // Process user data
        const doctors = users.filter(user => user.role === 'doctor');
        const admins = users.filter(user => user.role === 'admin');

        // Process feedback data
        const urgentFeedbacks = feedbackData.filter(feedback => feedback.urgent);
        
        // Calculate sentiment distribution
        const sentimentCounts = feedbackData.reduce((acc, feedback) => {
          const sentiment = feedback.sentiment || 'neutral';
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        }, { positive: 0, negative: 0, neutral: 0 });

        // Calculate top topics
        const topicCounts = {};
        feedbackData.forEach(feedback => {
          if (feedback.topics) {
            const topics = Array.isArray(feedback.topics) 
              ? feedback.topics 
              : feedback.topics.split(',').map(t => t.trim());
            
            topics.forEach(topic => {
              if (topic) {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
              }
            });
          }
        });

        const topTopics = Object.entries(topicCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([topic, count]) => ({
            topic,
            count,
            percentage: feedbackData.length > 0 ? ((count / feedbackData.length) * 100).toFixed(1) : 0
          }));

        // Calculate urgent percentage
        const urgentPercentage = feedbackData.length > 0 
          ? ((urgentFeedbacks.length / feedbackData.length) * 100).toFixed(1)
          : 0;

        // Get recent activities
        const recentActivities = feedbackData
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3)
          .map(feedback => ({
            action: `${feedback.urgent ? 'Urgent ' : ''}Feedback received`,
            user: `Patient ${feedback.patient_id?.substring(0, 8) || 'Unknown'}`,
            time: feedback.created_at ? new Date(feedback.created_at).toLocaleString() : 'Unknown',
            sentiment: feedback.sentiment
          }));

        setDashboardData({
          totalDoctors: doctors.length,
          totalAdmins: admins.length,
          totalFeedback: feedbackData.length,
          urgentFeedback: urgentFeedbacks.length,
          users,
          feedbackAnalytics: {
            sentimentDistribution: sentimentCounts,
            topTopics,
            urgentPercentage,
            recentTrends: recentActivities
          }
        });

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(error.message || 'Failed to load dashboard data');
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load dashboard data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAllUsers, fetchFeedbacks, showToast]);

  const handleChangePassword = () => {
    navigate('/admin/settings');
  };

  const stats = [
    {
      title: t('dashboard.totalDoctors'),
      value: dashboardData.totalDoctors.toString(),
      icon: <UserCheck className="w-6 h-6 text-white" />,
      color: 'bg-blue-500',
      delay: 0.1
    },
    {
      title: 'Total Admins',
      value: dashboardData.totalAdmins.toString(),
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-teal-500',
      delay: 0.2
    },
    {
      title: t('dashboard.urgentFeedback'),
      value: dashboardData.urgentFeedback.toString(),
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      color: 'bg-red-500',
      delay: 0.3
    },
    {
      title: 'Total Feedback',
      value: dashboardData.totalFeedback.toString(),
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      color: 'bg-green-500',
      delay: 0.4
    }
  ];

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin {t('dashboard.welcome')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            System overview and management dashboard
          </p>
        </motion.div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 dark:text-red-400 mb-4">
                {error}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
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
        title="Admin Dashboard"
        description="CareBridge admin dashboard for healthcare system management. Monitor users, analyze feedback, and oversee healthcare operations."
        keywords="healthcare admin, medical administration, healthcare analytics, patient feedback management, healthcare dashboard"
        ogTitle="Admin Dashboard - CareBridge Healthcare Management"
        ogDescription="Comprehensive admin dashboard for healthcare system oversight and management"
      />
      
      <div className="space-y-6">
        {/* First-time password change warning */}
        {showSecurityNotice && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Security Notice
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    If this is your first time accessing your account, kindly change your password for security reasons. If not, kindly ignore this message.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSecurityNoticeDismiss}
                className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-800/20 rounded-full p-1 transition-colors ml-4 flex-shrink-0"
                aria-label="Dismiss security notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Password Change Notification */}
        {needsPasswordChange && (
          <PasswordChangeNotification
            onDismiss={dismissNotification}
            onChangePassword={handleChangePassword}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin {t('dashboard.welcome')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            System overview and management dashboard
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} isLoading={isLoading} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent System Activity
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : dashboardData.feedbackAnalytics.recentTrends.length > 0 ? (
                    dashboardData.feedbackAnalytics.recentTrends.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {activity.user}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </span>
                          {activity.sentiment && (
                            <div className={`text-xs ${getSentimentColor(activity.sentiment)} mt-1`}>
                              {activity.sentiment}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Feedback Analytics
                  </h3>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Sentiment Distribution */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Sentiment Distribution
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(dashboardData.feedbackAnalytics.sentimentDistribution).map(([sentiment, count]) => {
                          const percentage = dashboardData.totalFeedback > 0 
                            ? ((count / dashboardData.totalFeedback) * 100).toFixed(1)
                            : 0;
                          return (
                            <div key={sentiment} className="flex items-center justify-between">
                              <span className={`text-sm capitalize ${getSentimentColor(sentiment)}`}>
                                {sentiment}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {count} ({percentage}%)
                                </span>
                                <div className={`w-3 h-3 rounded-full ${
                                  sentiment === 'positive' ? 'bg-green-500' : 
                                  sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                                }`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Topics */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Top Feedback Topics
                      </h4>
                      <div className="space-y-2">
                        {dashboardData.feedbackAnalytics.topTopics.length > 0 ? (
                          dashboardData.feedbackAnalytics.topTopics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {topic.topic}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {topic.count} ({topic.percentage}%)
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No topics available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Urgent Feedback Metrics */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Urgent Feedback
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Urgent vs Total
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {dashboardData.urgentFeedback}/{dashboardData.totalFeedback} ({dashboardData.feedbackAnalytics.urgentPercentage}%)
                          </span>
                          <div className={`w-3 h-3 rounded-full ${
                            parseFloat(dashboardData.feedbackAnalytics.urgentPercentage) > 20 ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};
