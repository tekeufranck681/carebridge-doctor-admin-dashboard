// Only additions/modifications are explained below
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuthStore } from '../../../stores/authStore';
import { useUserStore } from '../../../stores/userStore';
import { useToast } from '../../../contexts/ToastContext';
import { SEOHead } from '../../SEO/SEOHead';

export const DoctorSettings = () => {
  const { t } = useLanguage();
  const { updateUser } = useUserStore();
  const user = useAuthStore(state => state.user);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Preserve tab state and avoid unnecessary rerenders
  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        email: user.email || user.sub || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);
  

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profile.password && profile.password !== profile.confirmPassword) {
      showToast({
        type: 'error',
        title: t('common.error'),
        message: t('settings.passwordMismatch')
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        full_name: profile.full_name,
        email: profile.email,
        ...(profile.password ? { password: profile.password } : {})
      };

      // 🛠 Avoid triggering global state reset that could reset route
      await updateUser(user.id, updateData, { silent: true }); // Add optional param if needed

      showToast({
        type: 'success',
        title: t('common.success'),
        message: t('settings.profileUpdated')
      });

      // Only reset password fields
      setProfile((prev) => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (error) {
      showToast({
        type: 'error',
        title: t('common.error'),
        message: error.message || t('common.generalError')
      });
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Doctor Settings"
        description="Manage your CareBridge doctor account settings. Update profile information, change password, and configure medical practice preferences."
        keywords="doctor settings, medical profile, account management, doctor preferences, healthcare professional settings, medical practice configuration"
        ogTitle="Doctor Settings - CareBridge Healthcare Platform"
        ogDescription="Professional account settings and configuration for healthcare practitioners using CareBridge platform"
      />
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.settings')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleProfileUpdate}
                  className="flex items-center gap-2"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};
