/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { DoctorHome } from '../components/dashboard/doctor/DoctorHome';
import { DoctorPatients } from '../components/dashboard/doctor/DoctorPatients';
import { DoctorReminders } from '../components/dashboard/doctor/DoctorReminders';
import { DoctorSettings } from '../components/dashboard/doctor/DoctorSettings';
import { useAuthStore } from '../stores/authStore';

export const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const user = useAuthStore(state => state.user);

  // Prevent tab changes during loading states
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DoctorHome />;
      case 'patients':
        return <DoctorPatients />;
      case 'reminders':
        return <DoctorReminders />;
      case 'settings':
        return <DoctorSettings />;
      default:
        return <DoctorHome />;
    }
  };

  // This check is now redundant since ProtectedRoute handles it
  // but keeping it as a safety net
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </Layout>
  );
};
