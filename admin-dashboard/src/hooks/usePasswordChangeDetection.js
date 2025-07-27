import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const usePasswordChangeDetection = () => {
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!user) {
      setNeedsPasswordChange(false);
      return;
    }

    // Check if user needs to change password (applies to both admin and doctor)
    const createdAt = user.created_at;
    const updatedAt = user.updated_at;

    if (createdAt && updatedAt) {
      // Compare timestamps - if they're identical, password hasn't been changed
      const createdTime = new Date(createdAt).getTime();
      const updatedTime = new Date(updatedAt).getTime();
      
      // Allow for small time differences (within 1 second) due to potential timing issues
      const timeDifference = Math.abs(updatedTime - createdTime);
      const hasNotChangedPassword = timeDifference < 1000;

      setNeedsPasswordChange(hasNotChangedPassword && !notificationDismissed);
    } else {
      setNeedsPasswordChange(false);
    }
  }, [user, notificationDismissed]);

  // Reset dismissal when user changes (new login)
  useEffect(() => {
    if (user) {
      setNotificationDismissed(false);
    }
  }, [user?.id]);

  const dismissNotification = () => {
    setNotificationDismissed(true);
    setNeedsPasswordChange(false);
  };

  const resetDismissal = () => {
    setNotificationDismissed(false);
  };

  return {
    needsPasswordChange,
    dismissNotification,
    resetDismissal
  };
};
