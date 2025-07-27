import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, WifiOff, AlertTriangle, FileX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useLanguage } from '../contexts/LanguageContext';

const ErrorPageLayout = ({
  icon,
  title,
  message,
  showHomeButton = true
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        <Card className="p-8">
          <CardContent className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                {icon}
              </div>
            </motion.div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>

            {showHomeButton && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => navigate('/')}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  {t('error.goHome')}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export const NotFoundPage = () => {
  const { t } = useLanguage();
  
  return (
    <ErrorPageLayout
      icon={<FileX className="w-12 h-12 text-red-500" />}
      title={t('error.404.title')}
      message={t('error.404.message')}
    />
  );
};

export const OfflinePage = () => {
  const { t } = useLanguage();
  
  return (
    <ErrorPageLayout
      icon={<WifiOff className="w-12 h-12 text-red-500" />}
      title={t('error.offline.title')}
      message={t('error.offline.message')}
      showHomeButton={false}
    />
  );
};

export const ErrorPage = () => {
  const { t } = useLanguage();
  
  return (
    <ErrorPageLayout
      icon={<AlertTriangle className="w-12 h-12 text-red-500" />}
      title={t('error.general.title')}
      message={t('error.general.message')}
    />
  );
};