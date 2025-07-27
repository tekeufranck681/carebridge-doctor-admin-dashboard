import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export const ReminderTabs = ({ activeTab, setActiveTab, reminders }) => {
  const { t } = useLanguage();

  const tabButtons = [
    { id: 'all', label: t('reminders.all'), count: reminders.length },
    { id: 'appointment', label: t('reminders.appointment'), count: reminders.filter(r => r.type === 'appointment' && r.status === 'pending').length },
    { id: 'medication', label: t('reminders.medication'), count: reminders.filter(r => r.type === 'medication').length },
    { id: 'custom', label: t('reminders.custom'), count: reminders.filter(r => r.type === 'custom').length }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
      {tabButtons.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center gap-2 min-w-0 flex-shrink-0
            ${activeTab === tab.id
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }
          `}
        >
          <span className="truncate">{tab.label}</span>
          <span className="bg-white dark:bg-gray-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs flex-shrink-0">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};
