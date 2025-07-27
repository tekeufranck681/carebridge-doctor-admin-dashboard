import React, { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Bell,
  Settings,
  LogOut,
  UserCheck,
  UserPlus,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLanguage } from '../../contexts/LanguageContext';

// Memoize the Sidebar component to prevent unnecessary re-renders
export const Sidebar = memo(({
  isCollapsed,
  onToggle,
  activeTab,
  onTabChange
}) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile menu item selection
  const handleMobileTabChange = (tabId) => {
    onTabChange(tabId);
    if (isMobile && !isCollapsed) {
      onToggle(); // Close mobile sidebar after selection
    }
  };

  // Handle backdrop click on mobile
  const handleBackdropClick = () => {
    if (isMobile && !isCollapsed) {
      onToggle();
    }
  };

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isCollapsed]);

  const doctorMenuItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'patients', label: t('nav.patients'), icon: Users },
    { id: 'reminders', label: t('nav.reminders'), icon: Bell },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const adminMenuItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'admin-management', label: t('nav.adminManagement'), icon: UserCheck },
    { id: 'doctor-management', label: t('nav.doctorManagement'), icon: UserPlus },
    { id: 'feedback', label: t('nav.feedback'), icon: MessageSquare },
    { id: 'logs', label: t('nav.logs'), icon: FileText },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : doctorMenuItems;

  // Mobile sidebar variants
  const mobileVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Desktop sidebar variants
  const desktopVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden backdrop-blur-sm bg-black/20 dark:bg-black/30"
              onClick={handleBackdropClick}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <motion.div
          initial="closed"
          animate={isCollapsed ? "closed" : "open"}
          variants={mobileVariants}
          className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 md:hidden shadow-xl"
        >
          {/* Mobile Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CB</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 dark:text-white">CareBridge</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={t('sidebar.closeSidebar')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleMobileTabChange(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-200 min-h-[44px]
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium text-base">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px]"
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium text-base">
                {t('nav.logout')}
              </span>
            </button>
          </div>
        </motion.div>
      </>
    );
  }

  // Desktop Sidebar (existing functionality)
  return (
    <motion.div
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={desktopVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full md:flex"
    >
      {/* Desktop Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CB</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 dark:text-white">CareBridge</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={isCollapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium text-sm truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Desktop User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.sub || user?.email}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-medium text-sm"
              >
                {t('nav.logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
});
