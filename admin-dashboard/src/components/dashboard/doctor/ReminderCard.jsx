import React from 'react';
import { Calendar, Pill, Bell, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

const getReminderIcon = (type) => {
  switch (type) {
    case 'appointment': return <Calendar className="w-5 h-5" />;
    case 'medication': return <Pill className="w-5 h-5" />;
    case 'custom': return <Bell className="w-5 h-5" />;
    default: return <Bell className="w-5 h-5" />;
  }
};

const getReminderColor = (type) => {
  switch (type) {
    case 'appointment': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    case 'medication': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'custom': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
};

export const ReminderCard = ({ reminder, onDelete, onEdit }) => {
  const renderContent = () => {
    switch (reminder.type) {
      case 'appointment':
        return (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {reminder.title}
            </h3>
            <p className="text-sm mb-2">
              <span className="text-black">Status:</span>{' '}
              <span
                className={
                  reminder.status === 'pending'
                    ? 'font-bold text-yellow-600'
                    : reminder.status === 'cancelled'
                      ? 'text-red-600'
                      : 'text-gray-600 dark:text-gray-400'
                }
              >
                {reminder.status}
              </span>
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{reminder.date} at {reminder.time}</span>
              {reminder.patientName && (
                <span>Patient: {reminder.patientName}</span>
              )}
            </div>
          </>
        );

      case 'medication':
        return (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {reminder.medication_name || reminder.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Every {reminder.intervalHours} hours
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Phone: {reminder.phoneNumber}
            </div>
          </>
        );

      case 'custom':
        return (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Custom Reminder
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {reminder.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Send to: {reminder.to}</span>
              <span>Via: {reminder.channel}</span>
            </div>
          </>
        );

      default:
        return (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {reminder.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {reminder.description}
            </p>
          </>
        );
    }
  };

  return (
    <Card hover>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            <div className={`p-2 rounded-lg ${getReminderColor(reminder.type)} flex-shrink-0`}>
              {getReminderIcon(reminder.type)}
            </div>
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
            {(reminder.type === 'appointment' && reminder.status === 'pending' || reminder.type === 'medication' || reminder.type === 'custom') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(reminder)}
                className="p-2"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(reminder.id, reminder.type)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
