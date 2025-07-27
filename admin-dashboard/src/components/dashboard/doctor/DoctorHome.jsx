import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Bell, Pill, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../ui/Card';
import { PasswordChangeNotification } from '../../ui/PasswordChangeNotification';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuthStore } from '../../../stores/authStore';
import { usePatientStore } from '../../../stores/patientStore';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { useReminderStore } from '../../../stores/reminderStore';
import { useMedicationStore } from '../../../stores/medicationStore';
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

export const DoctorHome = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [isLoading, setIsLoading] = useState(true);
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
  const patients = usePatientStore(state => state.patients);
  const fetchPatients = usePatientStore(state => state.fetchPatients);
  
  const appointments = useAppointmentStore(state => state.appointments);
  const fetchAppointments = useAppointmentStore(state => state.fetchAppointments);
  
  const reminders = useReminderStore(state => state.reminders);
  const fetchReminders = useReminderStore(state => state.fetchReminders);
  
  const medications = useMedicationStore(state => state.medications);
  const fetchMedicationSchedules = useMedicationStore(state => state.fetchMedicationSchedules);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchPatients(),
          fetchAppointments(),
          fetchReminders(),
          fetchMedicationSchedules()
        ]);
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load dashboard data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [fetchPatients, fetchAppointments, fetchReminders, fetchMedicationSchedules, showToast]);

  const handleChangePassword = () => {
    navigate('/doctor/settings');
  };

  // Calculate stats from real data
  const stats = [
    {
      title: t('dashboard.patients'),
      value: patients.length.toString(),
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-blue-500',
      delay: 0.1
    },
    {
      title: t('dashboard.appointments'),
      value: appointments.filter(apt => apt.status === 'pending').length.toString(),
      icon: <Calendar className="w-6 h-6 text-white" />,
      color: 'bg-teal-500',
      delay: 0.2
    },
    {
      title: t('dashboard.reminders'),
      value: reminders.length.toString(),
      icon: <Bell className="w-6 h-6 text-white" />,
      color: 'bg-yellow-500',
      delay: 0.3
    },
    {
      title: t('dashboard.medications'),
      value: medications.length.toString(),
      icon: <Pill className="w-6 h-6 text-white" />,
      color: 'bg-green-500',
      delay: 0.4
    }
  ];

  return (
    <>
      <SEOHead 
        title="Doctor Dashboard"
        description="CareBridge doctor dashboard for patient management, appointments, and healthcare delivery. Access patient information and manage medical care efficiently."
        keywords="doctor dashboard, patient management, medical appointments, healthcare delivery, patient care"
        ogTitle="Doctor Dashboard - CareBridge Healthcare Management"
        ogDescription="Comprehensive doctor dashboard for patient care and medical practice management"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Here's an overview of your practice today.
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
                  Recent Activity
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : appointments.length > 0 ? (
                    appointments
                      .sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time))
                      .slice(0, 3)
                      .map((appointment, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Appointment scheduled
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Patient ID: {appointment.patient_id?.substring(0, 8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(appointment.appointment_time).toLocaleDateString()}
                            </span>
                            <div className={`text-xs mt-1 ${
                              appointment.status === 'pending' 
                                ? 'text-yellow-600' 
                                : appointment.status === 'cancelled'
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {appointment.status}
                            </div>
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Available Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Add New Patient
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Register a new patient in the system
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <div className="font-medium text-green-900 dark:text-green-100">
                      Schedule Appointment
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Mark a new appointment
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <div className="font-medium text-purple-900 dark:text-purple-100">
                      Create Reminder
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      Set up a new reminder
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};
