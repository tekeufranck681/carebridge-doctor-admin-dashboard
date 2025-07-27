import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Modal } from '../../ui/Modal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { usePatientStore } from '../../../stores/patientStore';
import { SEOHead } from '../../SEO/SEOHead';
import { useAuthStore } from '../../../stores/authStore';
import { Select } from '../../ui/Select';

export function DoctorPatients() {
    const { t } = useLanguage();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const defaultForm = {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
        password: '',
        department: 'Outpatient',
        notification_preferences: 'sms',
        language_preferences: 'en',
    };

    const [form, setForm] = useState(defaultForm);

    const fetchPatients = usePatientStore((state) => state.fetchPatients);
    const registerPatient = usePatientStore((state) => state.registerPatient);
    const patients = usePatientStore((state) => state.patients);
    const isLoading = usePatientStore((state) => state.isLoading);
    const user = useAuthStore((state) => state.user);
    const { showToast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
const handleSubmit = async () => {
  const doctorId = user?.id;

  if (!doctorId) {
    showToast({
      type: 'error',
      title: t('doctor.patients.toast.error'),
      message: t('auth.error.not_authenticated'),
    });
    return;
  }
  // Basic required fields validation with safe trim
  if (
    !form.first_name?.trim() ||
    !form.last_name?.trim() ||
    !form.email?.trim() ||
    !form.phone_number?.trim() ||
    !form.password ||  // password can be non-string but required
    !form.address?.trim() ||
    !form.department?.trim()
  ) {
    showToast({
      type: 'error',
      title: t('doctor.patients.toast.error'),
      message: t('doctor.patients.validation.required'),
    });
    return;
  }

  // Phone number validation: exactly 9 digits
  const phoneRegex = /^\d{9}$/;
  if (!phoneRegex.test(form.phone_number.trim())) {
    showToast({
      type: 'error',
      title: t('doctor.patients.toast.error'),
      message: t('doctor.patients.validation.phone_number_invalid') || 
               'Phone number must be exactly 9 digits.',
    });
    return;
  }

  // Password length validation: minimum 8 characters
  if (form.password.length < 8) {
    showToast({
      type: 'error',
      title: t('doctor.patients.toast.error'),
      message: t('doctor.patients.validation.password_too_short') || 
               'Password must be at least 8 characters long.',
    });
    return;
  }

  const patientData = {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone_number: form.phone_number.trim(),
    address: form.address.trim(),
    password: form.password,
    notification_preferences: form.notification_preferences,
    language_preferences: form.language_preferences,
  };

  try {
    const newPatient = await registerPatient({
      patientData,
      doctorId,
      department: form.department,
    });

    showToast({
      type: 'success',
      title: t('doctor.patients.toast.success'),
      message: `${newPatient.first_name} ${newPatient.last_name} ${t('doctor.patients.success')}`,
    });

    setForm(defaultForm);
    setIsAddModalOpen(false);
    fetchPatients();
  } catch (error) {
    showToast({
      type: 'error',
      title: t('doctor.patients.toast.error'),
      message: error?.message || t('doctor.patients.error'),
    });
  }
};

    useEffect(() => {
        const loadPatients = async () => {
            try {
                await fetchPatients();
            } catch (error) {
                showToast({
                    type: 'error',
                    title: t('doctor.patients.toast.error'),
                    message: error.message || 'Failed to load patients'
                });
            }
        };

        loadPatients();
    }, [fetchPatients, showToast, t]);

    return (
        <>
            <SEOHead 
                title="Patient Management"
                description="Manage your patients in CareBridge healthcare system. Add new patients, view patient records, update medical information, and track patient care."
                keywords="patient management, medical records, patient care, healthcare management, patient registration, medical information, doctor dashboard"
                ogTitle="Patient Management - Doctor Dashboard - CareBridge"
                ogDescription="Comprehensive patient management system for healthcare professionals to manage patient records and care"
            />
            
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold">{t('doctor.patients.title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            {t('doctor.patients.subtitle')}
                        </p>
                    </div>
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3"
                    >
                        {t('doctor.patients.add')}
                    </Button>
                </div>

                {/* Patient List */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 animate-pulse"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                    <div className="flex-1">
                                        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-full sm:w-20"></div>
                                </div>
                            </motion.div>
                        ))
                    ) : patients.length === 0 ? (
                        // Empty state
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 sm:p-12 text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {t('doctor.patients.noPatients')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Get started by registering your first patient
                            </p>
                            <Button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-3"
                            >
                                {t('doctor.patients.add')}
                            </Button>
                        </motion.div>
                    ) : (
                        // Patient list
                        patients.map((patient) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                    <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-medium">
                                            {patient.first_name} {patient.last_name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {patient.email}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            Patient ID: {patient.id}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setSelectedPatient(patient)}
                                        className="w-full sm:w-auto px-4 py-2 text-sm"
                                    >
                                        {t('common.view')}
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* View Patient Modal */}
                <Modal
                    isOpen={!!selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                    title={`${t('common.view')} ${t('doctor.patients.title')}`}
                >
                    {selectedPatient && (
                        <div className="space-y-2 text-gray-800 dark:text-gray-200">
                            <p><strong>{t('doctor.patients.first_name')}:</strong> {selectedPatient.first_name}</p>
                            <p><strong>{t('doctor.patients.last_name')}:</strong> {selectedPatient.last_name}</p>
                            <p><strong>{t('doctor.patients.email')}:</strong> {selectedPatient.email}</p>
                            <p><strong>{t('doctor.patients.phone_number')}:</strong> {selectedPatient.phone_number}</p>
                            <p><strong>{t('doctor.patients.address')}:</strong> {selectedPatient.address}</p>
                            <p><strong>{t('doctor.patients.language_preferences')}:</strong> {selectedPatient.language_preferences}</p>
                            <p><strong>{t('doctor.patients.notification_preferences')}:</strong> {selectedPatient.notification_preferences}</p>
                        </div>
                    )}
                </Modal>

                {/* Add Patient Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title={t('doctor.patients.add')}
                >
                    <div className="space-y-4 text-gray-800 dark:text-gray-200">
                        <Input label={t('doctor.patients.first_name')} name="first_name" value={form.first_name} onChange={handleChange} />
                        <Input label={t('doctor.patients.last_name')} name="last_name" value={form.last_name} onChange={handleChange} />
                        <Input label={t('doctor.patients.email')} name="email" value={form.email} onChange={handleChange} />
                        <Input label={t('doctor.patients.phone_number')} name="phone_number" value={form.phone_number} onChange={handleChange} />
                        <Input label={t('doctor.patients.address')} name="address" value={form.address} onChange={handleChange} />
                        <Input label={t('auth.password')} name="password" type="password" value={form.password} onChange={handleChange} />

                        <Select
                            label={t('doctor.patients.department')}
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            options={[
                                { value: 'Outpatient', label: t('doctor.patients.departments.outpatient') },
                                { value: 'Cardiology', label: t('doctor.patients.departments.cardiology') },
                                { value: 'Emergency', label: t('doctor.patients.departments.emergency') },
                                { value: 'Radiology', label: t('doctor.patients.departments.radiology') },
                                { value: 'Pediatrics', label: t('doctor.patients.departments.pediatrics') },
                                { value: 'Oncology', label: t('doctor.patients.departments.oncology') },
                            ]}
                        />

                        <Select
                            label={t('doctor.patients.notification_preferences')}
                            name="notification_preferences"
                            value={form.notification_preferences}
                            onChange={handleChange}
                            options={[
                                { value: 'sms', label: 'SMS' },
                                { value: 'voice', label: 'Voice' },
                            ]}
                        />

                        <Select
                            label={t('doctor.patients.language_preferences')}
                            name="language_preferences"
                            value={form.language_preferences}
                            onChange={handleChange}
                            options={[
                                { value: 'en', label: 'English' },
                                { value: 'fr', label: 'Français' }
                            ]}
                        />
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                            {t('doctor.patients.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            loading={isLoading}
                            onClick={handleSubmit}
                        >
                            {t('doctor.patients.submit')}
                        </Button>
                    </div>
                </Modal>
            </div>
        </>
    );
}
