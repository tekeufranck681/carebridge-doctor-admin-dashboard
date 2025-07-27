import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../contexts/LanguageContext';

export const PasswordChangeNotification = ({ onDismiss, onChangePassword }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleChangePassword = () => {
    setIsVisible(false);
    setTimeout(() => {
      onChangePassword();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  First-Time Access: Please change your initial password
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  If this is your first time accessing your account, please change your password from the default one assigned during account creation for enhanced security. If you have already changed your password, you can safely ignore this message.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChangePassword}
                className="text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-800/20 border border-amber-300 dark:border-amber-600 text-xs px-3 py-1"
              >
                Change Password
              </Button>
              <button
                onClick={handleDismiss}
                className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/20 rounded-full p-1 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
