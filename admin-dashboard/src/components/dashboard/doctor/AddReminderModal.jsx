import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
export const AddReminderModal = ({
  isOpen,
  onClose,
  reminderType,
  setReminderType,
  onSave,
  initialData,
  isEditing = false,
  isLoading,
  disabled 
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    description: '',
    date: '',
    time: '',
    
    // Appointment specific
    patient_id: '',
    status: 'pending',
    
    // Medication specific
    medication_name: '',
    interval_hours: '',
    
    // Custom reminder specific
    to: '',
    channel: 'sms',
    language: 'en'
  });

  // Initialize form with existing data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      if (reminderType === 'appointment') {
        const dateTime = new Date(initialData.appointment_time);
        setFormData({
          date: dateTime.toISOString().split('T')[0],
          time: dateTime.toTimeString().substring(0, 5),
          patient_id: initialData.patient_id,
          status: initialData.status || 'pending'
        });
      } else if (reminderType === 'medication') {
        setFormData({
          medication_name: initialData.medication_name,
          interval_hours: initialData.interval_hours,
          patient_id: initialData.patient_id
        });
      } else if (reminderType === 'custom') {
        setFormData({
          to: initialData.to,
          message: initialData.message,
          channel: initialData.channel,
          language: initialData.language || 'en'
        });
      }
    } else {
      // Reset form when creating new
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        patient_id: '',
        status: 'pending',
        medication_name: '',
        interval_hours: '',
        to: '',
        channel: 'sms',
        language: 'en'
      });
    }
  }, [isEditing, initialData, reminderType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    let payload;
    
    if (isEditing) {
      // Edit payloads (partial updates)
      switch(reminderType) {
        case 'appointment':
          payload = {};
          if (formData.date && formData.time) {
            payload.appointment_time = `${formData.date}T${formData.time}:00`;
          }
          break;
          
        case 'medication':
          payload = {};
          if(!formData.patient_id){
            showToast({
              type: 'error',
              title: 'Error',
              message: 'Patient ID is required'
            });
            return; 
          }
            payload.patient_id = formData.patient_id;
          
          if (formData.medication_name) {
            payload.medication_name = formData.medication_name;
          }
          if (formData.interval_hours) {
            payload.interval_hours = parseInt(formData.interval_hours);
          }
          break;
          
        case 'custom':
          payload = {
            to: formData.to,
            message: formData.description,
            channel: formData.channel,
            language: formData.language || 'en'
          };
          break;
          
        default:
          throw new Error('Invalid reminder type');
      }
    } else {
      // Create payloads (full objects)
      switch(reminderType) {
        case 'appointment':
          payload = {
            patient_id: formData.patient_id,
            appointment_time: `${formData.date}T${formData.time}:00`,
          };
          break;
          
        case 'medication':
          payload = {
            patient_id: formData.patient_id,
            medication_name: formData.medication_name,
            interval_hours: parseInt(formData.interval_hours)
          };
          break;
          
        case 'custom':
          payload = {
            to: formData.to,
            message: formData.description,
            channel: formData.channel,
            language: formData.language || 'en'
          };
          break;
          
        default:
          throw new Error('Invalid reminder type');
      }
    }
    
    onSave(reminderType, payload);
  };

  const renderFormFields = () => {
    switch(reminderType) {
      case 'appointment':
        return (
          <>
            {!isEditing && (
              <Input
                label="Patient ID"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                required={!isEditing}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <Input
                label="Time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );
        
      case 'medication':
        return (
          <>
              <Input
                label="Patient ID"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                required={!isEditing}
              />
            
            <Input
              label="Medication Name"
              name="medication_name"
              value={formData.medication_name}
              onChange={handleChange}
              required={!isEditing}
            />
            <Input
              label="Interval (hours)"
              type="number"
              name="interval_hours"
              value={formData.interval_hours}
              onChange={handleChange}
              min="1"
              required={!isEditing}
            />
          </>
        );
        
      case 'custom':
        return (
          <>
            <Input
              label="Phone Number"
              name="to"
              value={formData.to}
              onChange={handleChange}
              placeholder="6XXXXXXXXX"
              required
            />
            <Input
              label="Message"
              name="description"
              value={formData.description}
              onChange={handleChange}
              as="textarea"
              rows={3}
              required
            />
            <Select
              label="Channel"
              name="channel"
              value={formData.channel}
              onChange={handleChange}
              options={[
                { value: 'sms', label: 'SMS' },
                { value: 'voice', label: 'Voice Call' }
              ]}
            />
            <Select
              label="Language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              options={[
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'French' }
              ]}
            />
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${reminderType} Reminder` : `Create ${reminderType} Reminder`}
    >
      <div className="space-y-4">
        {!isEditing && (
          <Select
            label="Reminder Type"
            value={reminderType}
            onChange={(e) => setReminderType(e.target.value)}
            options={[
              { value: 'appointment', label: 'Appointment' },
              { value: 'medication', label: 'Medication' },
              { value: 'custom', label: 'Custom' }
            ]}
          />
        )}
        
        {renderFormFields()}
        
        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isLoading} disabled={disabled} >
            {isEditing ? t('common.edit') : t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};