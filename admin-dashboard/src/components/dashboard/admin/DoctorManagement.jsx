import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, UserPlus, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { useAuthStore } from '../../../stores/authStore';
import { useUserStore } from '../../../stores/userStore';
import { SEOHead } from '../../SEO/SEOHead';

export const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        full_name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(true);

    const { t } = useLanguage();
    const { showToast } = useToast();
    const { user, isAuthenticated } = useAuthStore();
    const { getAllUsers, signup, isLoading } = useUserStore();

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);
            const users = await getAllUsers();
            
            if (!Array.isArray(users)) {
                throw new Error('Invalid data format received');
            }

            // Filter only doctors from all users
            const doctorUsers = users
                .filter(user => user?.role === 'doctor')
                .map(user => ({
                    id: user.id,
                    full_name: user.full_name || 'N/A',
                    email: user.email || 'N/A',
                    role: user.role || 'unknown',
                    dateAdded: user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A',
                    status: 'active',
                    created_at: user.created_at // Keep for sorting
                }))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by newest first

            setDoctors(doctorUsers);
        } catch (error) {
            console.error('Doctor fetch error:', error);
            showToast({
                type: 'error',
                title: t('common.error'),
                message: error.message || 'Failed to fetch doctors'
            });
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, [getAllUsers, showToast, t]);

    const handleAddDoctor = async () => {
        try {
            if (!newDoctor.full_name || !newDoctor.email || !newDoctor.password) {
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Please fill all fields'
                });
                return;
            }

            if (newDoctor.password.length < 8) {
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Password must be at least 8 characters'
                });
                return;
            }

            await signup({
                ...newDoctor,
                role: 'doctor'
            });

            showToast({
                type: 'success',
                title: 'Success',
                message: 'Doctor added successfully'
            });

            setNewDoctor({
                full_name: '',
                email: '',
                password: ''
            });
            setShowAddModal(false);
            await fetchDoctors();
        } catch (error) {
            console.error('Add doctor error:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to add doctor'
            });
        }
    };

    const handleViewDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setShowViewModal(true);
    };

    useEffect(() => {
        // Only fetch doctors if user is authenticated and is admin
        console.log("authenticated", isAuthenticated, "userrole", user?.role)
        if (isAuthenticated && user?.role === 'admin') {
            fetchDoctors();
        } else if (isAuthenticated && user?.role !== 'admin') {
            showToast({
                type: 'error',
                title: 'Access Denied',
                message: 'You do not have permission to view this page'
            });
        }
    }, [isAuthenticated, user?.role, fetchDoctors, showToast]);

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You don't have permission to view this page.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="mt-3 text-gray-600 dark:text-gray-400">
                    Loading doctors...
                </span>
            </div>
        );
    }

    return (
        <>
            <SEOHead 
                title="Doctor Management"
                description="Manage healthcare professionals in CareBridge platform. Add new doctors, view doctor profiles, and oversee medical staff administration."
                keywords="doctor management, healthcare professionals, medical staff, physician management, healthcare administration, doctor registration"
                ogTitle="Doctor Management - CareBridge Healthcare Platform"
                ogDescription="Comprehensive doctor management system for healthcare professional oversight and medical staff administration"
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
                            {t('nav.doctorManagement')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage doctors in the system
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        variant="primary"
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t('common.add')} Doctor
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Registered Doctors
                            </h2>
                        </CardHeader>
                        <CardContent>
                            {doctors.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">No doctors found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Doctor
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Created At
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {doctors.map((doctor) => (
                                                <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
                                                                <UserPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {doctor.full_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {doctor.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {doctor.dateAdded}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                            {doctor.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDoctor(doctor)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Add Doctor Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add New Doctor"
                >
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            value={newDoctor.full_name}
                            onChange={(e) => setNewDoctor({ ...newDoctor, full_name: e.target.value })}
                            placeholder="Enter doctor's full name"
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={newDoctor.email}
                            onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                            placeholder="Enter email address"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={newDoctor.password}
                            onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                            placeholder="Enter password (min 8 characters)"
                            required
                            minLength={8}
                        />
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowAddModal(false)}
                                disabled={isLoading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddDoctor}
                                disabled={isLoading}
                                isLoading={isLoading}
                            >
                                {t('common.add')} Doctor
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* View Doctor Modal */}
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="Doctor Details"
                >
                    {selectedDoctor && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedDoctor.full_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedDoctor.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedDoctor.status}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date Added
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedDoctor.dateAdded}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </>
    );
};
