import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/SEO/SEOHead';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to CareBridge healthcare management system."
        keywords="404 error, page not found, healthcare management"
        ogTitle="Page Not Found - CareBridge"
        ogDescription="The requested page could not be found"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="mb-8">
            <AlertTriangle className="w-24 h-24 text-red-400 mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};