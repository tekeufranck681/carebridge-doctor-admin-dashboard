import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { AdminHome } from '../components/dashboard/admin/AdminHome';
import { AdminManagement } from '../components/dashboard/admin/AdminManagement';
import { DoctorManagement } from '../components/dashboard/admin/DoctorManagement';
import { FeedbackManagement } from '../components/dashboard/admin/FeedbackManagement';
import { LogsManagement } from '../components/dashboard/admin/LogsManagement';
import { AdminSettings } from '../components/dashboard/admin/AdminSettings';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');

  console.log('AdminDashboard render - activeTab:', activeTab);

  const handleTabChange = useCallback((newTab) => {
    console.log('AdminDashboard handleTabChange called with:', newTab);
    setActiveTab(newTab);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <AdminHome />;
      case 'admin-management':
        return <AdminManagement />;
      case 'doctor-management':
        return <DoctorManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'logs':
        return <LogsManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};
