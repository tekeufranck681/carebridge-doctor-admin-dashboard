import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { ReminderTabs } from './ReminderTabs';
import { ReminderList } from './ReminderList';
import { EmptyState } from './EmptyState';
import { AddReminderModal } from './AddReminderModal';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { useMedicationStore } from '../../../stores/medicationStore';
import { useReminderStore } from '../../../stores/reminderStore';
import { usePatientStore } from '../../../stores/patientStore';
import { SEOHead } from '../../SEO/SEOHead';

export const DoctorReminders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reminderType, setReminderType] = useState('appointment');
  const [isLoading, setIsLoading] = useState(true);
  const [combinedReminders, setCombinedReminders] = useState([]);
  const [editingReminder, setEditingReminder] = useState(null);
  const [isTransformingData, setIsTransformingData] = useState(false);
  const isEditing = Boolean(editingReminder);
  


  const { t } = useLanguage();
  const { showToast } = useToast();

  // Zustand store hooks with proper selectors
  const appointments = useAppointmentStore(state => state.appointments);
  const fetchAppointments = useAppointmentStore(state => state.fetchAppointments);
  const createAppointment = useAppointmentStore(state => state.createAppointment);
  const cancelAppointment = useAppointmentStore(state => state.cancelAppointment);
  const updateAppointment = useAppointmentStore(state => state.updateAppointment)

  const medications = useMedicationStore(state => state.medications);
  const fetchMedicationSchedules = useMedicationStore(state => state.fetchMedicationSchedules);
  const createMedicationSchedule = useMedicationStore(state => state.createMedicationSchedule);
  const deleteMedicationSchedule = useMedicationStore(state => state.deleteMedicationSchedule);
   const updateMedicationSchedule = useMedicationStore(state => state.updateMedicationSchedule)

  const reminders = useReminderStore(state => state.reminders);
  const fetchReminders = useReminderStore(state => state.fetchReminders);
  const createReminder = useReminderStore(state => state.createReminder);
  const deleteReminder = useReminderStore(state => state.deleteReminder);
  const updateReminder = useReminderStore(state => state.updateReminder)

  const getPatientById = usePatientStore(state => state.getPatientById);


  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setReminderType(reminder.type);
    setShowAddModal(true);
  };

  // Memoized date parser
  const parseDate = useCallback((dateString) => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  }, []);

  // Memoized data transformer
  const transformData = useCallback(async () => {
    try {
      setIsTransformingData(true);
      
      // Process appointments with patient data
      const formattedAppointments = await Promise.all(
        appointments.map(async (appt) => {
          try {
            const patient = await getPatientById(appt.patient_id);
            return {
              id: appt.id,
              type: 'appointment',
              title: `Appointment with ${patient?.first_name + " " + patient?.last_name || `Patient ${appt.patient_id.substring(0, 6)}`}`,
              description: `Status: ${appt.status}`,
              date: parseDate(appt.appointment_time).toISOString().split('T')[0],
              time: parseDate(appt.appointment_time).toTimeString().substring(0, 5),
              patientName: patient?.first_name,
              patientId: appt.patient_id,
              status: appt.status,
              rawData: appt
            };
          } catch (error) {
            console.error('Error fetching patient:', error);
            return {
              id: appt.id,
              type: 'appointment',
              title: `Appointment with Patient ${appt.patient_id.substring(0, 6)}`,
              description: `Status: ${appt.status}`,
              date: parseDate(appt.appointment_time).toISOString().split('T')[0],
              time: parseDate(appt.appointment_time).toTimeString().substring(0, 5),
              patientId: appt.patient_id,
              status: appt.status,
              rawData: appt
            };
          }
        })
      );

      // Process medications
      const formattedMedications = medications.map(med => ({
        id: med.id,
        type: 'medication',
        title: med.medication_name,
        description: `Every ${med.interval_hours} hours`,
        date: parseDate(med.last_reminder_time).toISOString().split('T')[0],
        phoneNumber: med.phone_number,
        intervalHours: med.interval_hours,
        rawData: med
      }));

      // Process custom reminders
      const formattedReminders = reminders.map(rem => ({
        id: rem.id,
        type: 'custom',
        title: 'Custom reminder',
        description: rem.message,
        date: parseDate(rem.created_at).toISOString().split('T')[0],
        to: rem.to,
        channel: rem.channel,
        status: rem.status,
        rawData: rem
      }));

      setCombinedReminders([
        ...formattedAppointments,
        ...formattedMedications,
        ...formattedReminders
      ]);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to transform data'
      });
    } finally {
      setIsTransformingData(false);
    }
  }, [appointments, medications, reminders, getPatientById, parseDate, showToast]);

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchAppointments(),
          fetchMedicationSchedules(),
          fetchReminders()
        ]);
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to load reminders'
        });
      } finally {
        // Always set loading to false after fetch attempt
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [fetchAppointments, fetchMedicationSchedules, fetchReminders, showToast]);

  // Transform data when stores update
  useEffect(() => {
    // Early exit if still loading
    if (isLoading) return;

    // Check if all stores are empty
    const hasNoData = appointments.length === 0 && medications.length === 0 && reminders.length === 0;
    
    if (hasNoData) {
      // Skip transformation for empty data - show empty state immediately
      setCombinedReminders([]);
      setIsTransformingData(false);
      return;
    }

    // Only transform data if we have actual data
    if (appointments.length > 0 || medications.length > 0 || reminders.length > 0) {
      transformData();
    }
  }, [appointments, medications, reminders, transformData, isLoading]);

  const filteredReminders = combinedReminders.filter(reminder =>
    activeTab === 'all' || reminder.type === activeTab
  );

  const handleAddReminder = async (type, payload) => {
    try {
      setIsLoading(true);
      let response;

      switch (type) {
        case 'appointment':
          if(!payload.patient_id || !payload.appointment_time) {
            showToast({
              type: 'error',
              title: 'Error',
              message: 'Patient ID and appointment time are required'
            });
           return;
          }
          response = await createAppointment({
            patient_id: payload.patient_id,
            appointment_time: payload.appointment_time,
          });
          break;

        case 'medication':
          if(!payload.patient_id || !payload.medication_name || !payload.interval_hours) {
            showToast({
              type: 'error',
              title: 'Error',
              message: 'Patient ID, medication name, and interval hours are required'
            });
            return;
          }
          response = await createMedicationSchedule({
            patient_id: payload.patient_id,
            medication_name: payload.medication_name,
            interval_hours: payload.interval_hours,
          });
          break;

        case 'custom':
        if(!payload.to || !payload.message || !payload.channel) {
          showToast({ 
            type: 'error',
            title: 'Error',
            message: 'Recipient, message, and channel are required'
          });
          return;
        }
          response = await createReminder({
            to: payload.to,
            message: payload.message,
            channel: payload.channel,
            language: payload.language || 'en'
          });
          break;

        default:
          throw new Error('Invalid reminder type');
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: `${type} reminder created successfully`
      });
      setShowAddModal(false);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to create ${type} reminder`
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdateReminder = async (type, payload) => {
  try {
    setIsLoading(true);
    let response;

    switch (type) {
      case 'appointment':
        response = await updateAppointment(
          editingReminder.id,
          editingReminder.patientId,
          { appointment_time: payload.appointment_time }
        );
        break;

      case 'medication':
        response = await updateMedicationSchedule(
          editingReminder.id,
          payload.patient_id,
          {
            medication_name: payload.medication_name,
            interval_hours: payload.interval_hours
          }
        );
        break;

      case 'custom':
        response = await updateReminder(
          editingReminder.id,
          {
            to: payload.to,
            message: payload.message,
            channel: payload.channel,
            language: payload.language || 'en'
          }
        );
        break;

      default:
        throw new Error('Invalid reminder type for editing');
    }

    // Refetch data after update
    await Promise.all([
      fetchAppointments(),
      fetchMedicationSchedules(),
      fetchReminders()
    ]);

    showToast({
      type: 'success',
      title: 'Success',
      message: `${type} reminder updated successfully`
    });
    setShowAddModal(false);
    setEditingReminder(null);
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: error.message || `Failed to update ${type} reminder`
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleDeleteReminder = async (reminderId, type) => {
    try {
      setIsLoading(true);

      switch (type) {
        case 'appointment':
          await cancelAppointment(reminderId);
          break;
        case 'medication':
          await deleteMedicationSchedule(reminderId);
          break;
        case 'custom':
          await deleteReminder(reminderId);
          break;
        default:
          throw new Error('Invalid reminder type');
      }

      // Refetch data after deletion
      await Promise.all([
        fetchAppointments(),
        fetchMedicationSchedules(),
        fetchReminders()
      ]);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Reminder deleted successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete reminder'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner during initial load or data transformation (only when data exists)
  if (isLoading || (isTransformingData && (appointments.length > 0 || medications.length > 0 || reminders.length > 0))) {
    return (
      <>
        <SEOHead 
          title="Reminders Management"
          description="Manage medical reminders and notifications in CareBridge. Set appointment reminders, medication schedules, and custom notifications for patient care."
          keywords="medical reminders, appointment reminders, medication reminders, patient notifications, healthcare scheduling, doctor reminders, medical alerts"
          ogTitle="Reminders Management - Doctor Dashboard - CareBridge"
          ogDescription="Comprehensive reminder management system for healthcare professionals to manage patient appointments and medication schedules"
        />
        
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <AddReminderModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingReminder(null);
          }}
          reminderType={reminderType}
          setReminderType={setReminderType}
          onSave={isEditing ? handleUpdateReminder : handleAddReminder}
          initialData={editingReminder?.rawData || null}
          isEditing={isEditing}
          isLoading={isLoading}
          disabled={isLoading || (isEditing && !editingReminder)}
        />
      </>
    );
  }

  // Show empty state when loading is complete and no reminders exist
  if (!isLoading && combinedReminders.length === 0) {
    return (
      <>
        <SEOHead 
          title="Reminders Management"
          description="Manage medical reminders and notifications in CareBridge. Set appointment reminders, medication schedules, and custom notifications for patient care."
          keywords="medical reminders, appointment reminders, medication reminders, patient notifications, healthcare scheduling, doctor reminders, medical alerts"
          ogTitle="Reminders Management - Doctor Dashboard - CareBridge"
          ogDescription="Comprehensive reminder management system for healthcare professionals to manage patient appointments and medication schedules"
        />
        
        <EmptyState
          setShowAddModal={setShowAddModal}
          setReminderType={setReminderType}
        />
        <AddReminderModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingReminder(null);
          }}
          reminderType={reminderType}
          setReminderType={setReminderType}
          onSave={isEditing ? handleUpdateReminder : handleAddReminder}
          initialData={editingReminder?.rawData || null}
          isEditing={isEditing}
          isLoading={isLoading}
          disabled={isLoading || (isEditing && !editingReminder)}
        />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Reminders Management"
        description="Manage medical reminders and notifications in CareBridge. Set appointment reminders, medication schedules, and custom notifications for patient care."
        keywords="medical reminders, appointment reminders, medication reminders, patient notifications, healthcare scheduling, doctor reminders, medical alerts"
        ogTitle="Reminders Management - Doctor Dashboard - CareBridge"
        ogDescription="Comprehensive reminder management system for healthcare professionals to manage patient appointments and medication schedules"
      />
      
      <div className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t('nav.reminders')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Manage your reminders and notifications
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            {t('reminders.create')}
          </Button>
        </motion.div>

        <ReminderTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reminders={combinedReminders}
        />

        {isLoading || isTransformingData ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ReminderList
            reminders={filteredReminders}
            onDelete={handleDeleteReminder}
            onEdit={handleEditReminder}
          />
        )}

        <AddReminderModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingReminder(null);
          }}
          reminderType={reminderType}
          setReminderType={setReminderType}
          onSave={isEditing ? handleUpdateReminder : handleAddReminder}
          initialData={editingReminder?.rawData || null}
          isEditing={isEditing}
          isLoading={isLoading}
          disabled={isLoading || (isEditing && !editingReminder)}
        />
      </div>
    </>
  );
};
