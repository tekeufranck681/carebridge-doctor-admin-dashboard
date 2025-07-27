import React from 'react';
import { motion } from 'framer-motion';
import { ReminderCard } from './ReminderCard';

export const ReminderList = ({ reminders, onDelete, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid gap-4"
    >
      {reminders.map((reminder) => (
        <ReminderCard 
          key={reminder.id} 
          reminder={reminder} 
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </motion.div>
  );
};