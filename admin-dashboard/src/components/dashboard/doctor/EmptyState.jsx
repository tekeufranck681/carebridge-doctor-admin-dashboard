import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Calendar, Pill, Bell } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export const EmptyState = ({ setShowAddModal, setReminderType }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('nav.reminders')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up reminders for appointments and medications
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('reminders.noReminders')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first reminder
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => { 
                setReminderType('appointment'); 
                setShowAddModal(true); 
              }}>
                <Calendar className="w-4 h-4 mr-2" />
                {t('reminders.appointment')}
              </Button>
              <Button onClick={() => { 
                setReminderType('medication'); 
                setShowAddModal(true); 
              }} variant="secondary">
                <Pill className="w-4 h-4 mr-2" />
                {t('reminders.medication')}
              </Button>
              <Button onClick={() => { 
                setReminderType('custom'); 
                setShowAddModal(true); 
              }} variant="secondary">
                <Bell className="w-4 h-4 mr-2" />
                {t('reminders.custom')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
