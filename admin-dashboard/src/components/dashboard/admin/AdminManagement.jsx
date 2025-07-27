import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, UserCheck, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { useAuthStore } from '../../../stores/authStore';
import { useUserStore } from '../../../stores/userStore';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../SEO/SEOHead';

export const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        full_name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(true);

    const { t } = useLanguage();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { user, isAuthLoading } = useAuthStore();
    const { getAllUsers, signup, isLoading } = useUserStore();

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const users = await getAllUsers();
            
            if (!Array.isArray(users)) {
                throw new Error('Invalid data format received');
            }

            const adminUsers = users
                .filter(u => u?.role === 'admin' && u.id !== user?.id) // Exclude current admin
                .map(u => ({
                    id: u.id,
                    name: u.full_name || 'N/A',
                    email: u.email || 'N/A',
                    role: u.role || 'unknown',
                    dateAdded: u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : 'N/A',
                    status: 'active',
                    created_at: u.created_at // Keep for sorting
                }))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by newest first

            setAdmins(adminUsers);
        } catch (error) {
            console.error('Admin fetch error:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to fetch admins'
            });
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    }, [getAllUsers, showToast, user?.id]); // Add user?.id as dependency

    const handleViewAdmin = (admin) => {
        setSelectedAdmin(admin);
        setShowViewModal(true);
    };

    const handleAddAdmin = async () => {
        try {
            if (!newAdmin.full_name || !newAdmin.email || !newAdmin.password) {
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Please fill all fields'
                });
                return;
            }

            if (newAdmin.password.length < 8) {
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Password must be at least 8 characters'
                });
                return;
            }

            await signup({
                ...newAdmin,
                role: 'admin'
            });

            showToast({
                type: 'success',
                title: 'Success',
                message: 'Admin added successfully'
            });

            setNewAdmin({
                full_name: '',
                email: '',
                password: ''
            });
            setShowAddModal(false);
            await fetchAdmins();
        } catch (error) {
            console.error('Add admin error:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to add admin'
            });
        }
    };

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user || user.role !== 'admin') {
            showToast({
                type: 'error',
                title: 'Access Denied',
                message: 'You do not have permission to view this page'
            });
            navigate('/');
            return;
        }

        const timer = setTimeout(() => {
            fetchAdmins();
        }, 100);

        return () => clearTimeout(timer);
    }, [user, isAuthLoading, fetchAdmins, navigate, showToast]);

    if (isAuthLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="mt-3 text-gray-600 dark:text-gray-400">
                    Loading administrators...
                </span>
            </div>
        );
    }

    return (
        <>
            <SEOHead 
                title="Admin Management"
                description="Manage system administrators in CareBridge healthcare platform. Add new admins, view admin profiles, and oversee administrative access control."
                keywords="admin management, system administrators, healthcare admin, user management, administrative control, healthcare platform management"
                ogTitle="Admin Management - CareBridge Healthcare Platform"
                ogDescription="Comprehensive admin management system for healthcare platform oversight and user administration"
            />
            
            <div className="space-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t('nav.adminManagement')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage system administrators
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        variant="primary"
                        className="flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <Plus className="w-4 h-4" />
                        {t('common.add')} Admin
                    </Button>
                </motion.div>

                {/* Admins Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                System Administrators
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    {/* Table Head */}
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Date Added
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    
                                    {/* Table Body */}
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {admins.map((admin) => (
                                            <motion.tr
                                                key={admin.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                                            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {admin.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {admin.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                                        {admin.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {admin.dateAdded}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                        {admin.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewAdmin(admin)}
                                                        aria-label="View admin details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Add Admin Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add New Admin"
                >
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            value={newAdmin.full_name}
                            onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                            placeholder="Enter full name"
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            placeholder="Enter email address"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={newAdmin.password}
                            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
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
                                onClick={handleAddAdmin}
                                disabled={isLoading}
                                isLoading={isLoading}
                            >
                                {t('common.add')} Admin
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* View Admin Modal */}
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="Admin Details"
                >
                    {selectedAdmin && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedAdmin.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedAdmin.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedAdmin.role}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date Added
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{selectedAdmin.dateAdded}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                        {selectedAdmin.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </>
    );
};
