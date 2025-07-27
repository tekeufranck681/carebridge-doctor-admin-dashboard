import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Heart, Sun, Moon, Languages, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuthStore } from "../stores/authStore";
import { SEOHead } from '../components/SEO/SEOHead';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('doctor');
    const login = useAuthStore(state => state.login);
    const isLoading = useAuthStore(state => state.isLoading);
    const clearError = useAuthStore(state => state.clearError);

 
    const { t, language, toggleLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { user } = await login({ email, password, role });
            showToast({
                type: "success",
                title: "Login successful",
                message: `Welcome back, ${user.full_name}`,
            });
            navigate(role === "admin" ? "/admin" : "/doctor");
        } catch (err) {
            showToast({
                type: "error",
                title: "Login failed",
                message: err.message || "Invalid credentials. Please try again.",
            });
        } finally {
            clearError(); // optional if you're resetting the error state
        }
    };
    const roleOptions = [
        { value: "doctor", label: t("auth.doctor") },
        { value: "admin", label: t("auth.admin") },
    ];

    return (
        <>
            <SEOHead 
                title="Login"
                description="Access your CareBridge healthcare management account. Secure login for doctors, administrators, and healthcare professionals."
                keywords="healthcare login, medical software access, doctor login, admin login, healthcare management system"
                ogTitle="Login to CareBridge Healthcare Management"
                ogDescription="Secure access to your healthcare management dashboard"
            />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
                    <div className="absolute top-10 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500" />
                </div>

                {/* Controls */}
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                        <Languages className="w-4 h-4" />
                        <span className="text-sm font-medium uppercase">{language}</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                        {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </motion.button>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                CareBridge
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t("dashboard.welcome")}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {t("auth.login")}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                                            {t('signin')}
                                        </p>
                                    </div>

                                    <Select
                                        label={t("auth.role")}
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        options={roleOptions}
                                    />

                                    <Input
                                        type="email"
                                        label={t("auth.email")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />

                                    <Input
                                        type="password"
                                        label={t("auth.password")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        loading={isLoading}
                                        className="w-full"
                                    >
                                        {t("auth.signin")}
                                    </Button>

                                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        <p>Demo credentials:</p>
                                        <p>Doctor: doctor@gmail.com / testdoctor</p>
                                        <p>Admin: testadmin@gmail.com / testadmin</p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};
