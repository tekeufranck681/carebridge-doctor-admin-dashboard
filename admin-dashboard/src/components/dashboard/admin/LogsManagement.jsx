import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Info, CheckCircle, XCircle, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { useEventStore } from '../../../stores/eventStore';
import { SEOHead } from '../../SEO/SEOHead';

export const LogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [daysInput, setDaysInput] = useState('');

  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const { 
    events, 
    fetchEvents, 
    deleteEventsOlderThan,
    deleteEventById,
    isLoading, 
    error 
  } = useEventStore();

  // Map event types to log levels
  const mapEventTypeToLevel = useCallback((eventType) => {
    const mapping = {
      'user_login': 'info',
      'user_registration': 'success',
      'feedback_analyzed': 'info',
      'feedback_submission': 'success',
      'system_error': 'error',
      'authentication_failed': 'warning',
      'data_export': 'info',
      'system_backup': 'success',
      'user_logout': 'info'
    };
    return mapping[eventType] || 'info';
  }, []);

  // Map event types to user-friendly messages
  const mapEventTypeToMessage = useCallback((eventType, details) => {
    const messages = {
      'user_login': 'User login successful',
      'user_registration': 'New user registered',
      'feedback_analyzed': 'Feedback analyzed',
      'feedback_submission': 'Feedback submitted',
      'system_error': 'System error occurred',
      'authentication_failed': 'Authentication failed',
      'data_export': 'Data export completed',
      'system_backup': 'System backup completed',
      'user_logout': 'User logout'
    };
    return details || messages[eventType] || 'System event';
  }, []);

  // Transform events to logs format
  const transformEventsToLogs = useCallback((events) => {
    return events.map(event => ({
      id: event.id,
      level: mapEventTypeToLevel(event.event_type),
      message: mapEventTypeToMessage(event.event_type, event.details),
      timestamp: new Date(event.timestamp).toLocaleString(),
      user: event.user_id ? `User ${event.user_id.substring(0, 8)}` : null,
      action: event.event_type.toUpperCase(),
      role: event.role
    }));
  }, [mapEventTypeToLevel, mapEventTypeToMessage]);

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchEvents();
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to load events'
        });
      }
    };

    loadEvents();
  }, [fetchEvents, showToast]);

  // Transform events when they change
  useEffect(() => {
    if (events && events.length > 0) {
      const transformedLogs = transformEventsToLogs(events);
      setLogs(transformedLogs);
    } else {
      setLogs([]);
    }
  }, [events, transformEventsToLogs]);

  const filteredLogs = logs.filter(log => 
    filterLevel === 'all' || log.level === filterLevel
  );

  const getLevelIcon = (level) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const handleDeleteIndividualLog = async (logId) => {
    try {
      await deleteEventById(logId);
      showToast({
        type: 'success',
        title: 'Log Deleted',
        message: 'Log entry has been deleted successfully.'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete log entry'
      });
    }
  };

  const handleDeleteOldLogs = async () => {
    if (!daysInput || daysInput.trim() === '') {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please enter the number of days'
      });
      return;
    }

    const days = parseInt(daysInput);
    if (isNaN(days) || days <= 0) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please enter a valid positive number'
      });
      return;
    }

    try {
      const result = await deleteEventsOlderThan(days);
      setDaysInput(''); // Clear input after successful deletion
      showToast({
        type: 'success',
        title: 'Old Logs Deleted',
        message: result
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete old logs'
      });
    }
  };

  const levelFilters = [
    { id: 'all', label: 'All', count: logs.length },
    { id: 'info', label: 'Info', count: logs.filter(l => l.level === 'info').length },
    { id: 'warning', label: 'Warning', count: logs.filter(l => l.level === 'warning').length },
    { id: 'error', label: 'Error', count: logs.filter(l => l.level === 'error').length },
    { id: 'success', label: 'Success', count: logs.filter(l => l.level === 'success').length }
  ];

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('nav.logs')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage system logs
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 dark:text-red-400">
                Error loading logs: {error}
              </p>
              <Button 
                onClick={() => fetchEvents()} 
                className="mt-4"
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
        title="System Logs"
        description="Monitor and manage CareBridge healthcare system logs. Track user activities, system events, security logs, and audit trails for compliance."
        keywords="system logs, audit trails, healthcare compliance, system monitoring, security logs, user activity tracking, healthcare system management"
        ogTitle="System Logs Management - CareBridge Healthcare Platform"
        ogDescription="Comprehensive system logging and monitoring for healthcare platform security and compliance"
      />
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('nav.logs')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage system logs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={daysInput}
              onChange={(e) => setDaysInput(e.target.value)}
              placeholder="Enter days (e.g., 30)"
              className="w-48"
              min="1"
              disabled={isLoading}
            />
            <Button
              onClick={handleDeleteOldLogs}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Calendar className="w-4 h-4" />
              Delete Old Logs
            </Button>
          </div>
        </motion.div>

        {/* Level Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-2 mb-6">
            {levelFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterLevel(filter.id)}
                disabled={isLoading}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2
                  ${filterLevel === filter.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {filter.label}
                <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Logs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Logs
                </h2>
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && logs.length === 0 ? (
                // Loading skeleton
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {logs.length === 0 ? 'No logs found' : 'No logs match the selected filter'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0 pr-10">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {log.message}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {log.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {log.action && (
                            <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                              {log.action}
                            </span>
                          )}
                          {log.user && (
                            <span>User: {log.user}</span>
                          )}
                          {log.role && (
                            <span className="capitalize">Role: {log.role}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteIndividualLog(log.id)}
                        disabled={isLoading}
                        className={`
                          absolute top-4 right-4 p-1.5 rounded-lg transition-colors flex-shrink-0
                          ${isLoading 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }
                        `}
                        title="Delete log entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};
