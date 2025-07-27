import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.role': 'Role',
    'auth.admin': 'Admin',
    'auth.doctor': 'Doctor',
    'auth.signin': 'Sign In',
    'signin': "Sign in to your account",

    // Navigation
    'nav.home': 'Home',
    'nav.patients': 'Patients',
    'nav.reminders': 'Reminders',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.adminManagement': 'Admin Management',
    'nav.doctorManagement': 'Doctor Management',
    'nav.feedback': 'Feedback',
    'nav.logs': 'Logs',

    // Header
    'header.openMenu': 'Open menu',
    'header.closeMenu': 'Close menu',

    // Sidebar
    'sidebar.expandSidebar': 'Expand sidebar',
    'sidebar.collapseSidebar': 'Collapse sidebar',
    'sidebar.closeSidebar': 'Close sidebar',

    // Layout
    'layout.loading': 'Loading...',

    // Dashboard
    'dashboard.welcome': 'Welcome to CareBridge',
    'dashboard.patients': 'Patients',
    'dashboard.appointments': 'Appointments',
    'dashboard.reminders': 'Reminders',
    'dashboard.medications': 'Medications',
    'dashboard.totalDoctors': 'Total Doctors',
    'dashboard.urgentFeedback': 'Urgent Feedback',

    // Patients
    'patients.register': 'Register New Patient',
    'patients.viewAll': 'View All Patients',
    'patients.name': 'Name',
    'patients.age': 'Age',
    'patients.phone': 'Phone',
    'patients.email': 'Email',
    'patients.address': 'Address',
    'patients.medicalHistory': 'Medical History',

    // Doctor Patients
    'doctor.patients.title': 'Patients',
    'doctor.patients.subtitle': 'Manage your patient records',
    'doctor.patients.add': 'Add Patient',
    'doctor.patients.first_name': 'First Name',
    'doctor.patients.last_name': 'Last Name',
    'doctor.patients.email': 'Email',
    'doctor.patients.phone_number': 'Phone Number',
    'doctor.patients.address': 'Address',
    'doctor.patients.language_preferences': 'Language Preference',
    'doctor.patients.notification_preferences': 'Notification Preference',
    'doctor.patients.submit': 'Submit',
    'doctor.patients.cancel': 'Cancel',
    'doctor.patients.success': 'Patient registered successfully',
    'doctor.patients.error': 'Failed to register patient',
    'doctor.patients.department': 'Department',
    'doctor.patients.departments.outpatient': 'Outpatient',
    'doctor.patients.departments.cardiology': 'Cardiology',
    'doctor.patients.departments.emergency': 'Emergency',
    'doctor.patients.departments.radiology': 'Radiology',
    'doctor.patients.departments.pediatrics': 'Pediatrics',
    'doctor.patients.departments.oncology': 'Oncology',
    'doctor.patients.toast.success': 'Success',
    'doctor.patients.toast.error': 'Error',
    'doctor.patients.validation.required': 'Please fill all required fields',
    'doctor.patients.validation.phone_number_invalid': 'Phone number must be exactly 9 digits.',
    'doctor.patients.validation.password_too_short': 'Password must be at least 8 characters long.',
    'doctor.patients.noPatients': "No patients found",

    // Reminders
    'reminders.appointment': 'Appointment Reminder',
    'reminders.medication': 'Medication Schedule',
    'reminders.custom': 'Custom Reminder',
    'reminders.noReminders': 'No reminders found',
    'reminders.create': 'Create New Reminder',
    'reminders.all': 'All',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.actions': 'Actions',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'common.close': 'Close',
    'common.error': 'Error',

    // Settings
    'settings.profileUpdated': 'Profile updated successfully',
    'settings.passwordMismatch': 'Passwords do not match',

    // Errors
    'error.404.title': 'Page Not Found',
    'error.404.message': 'The page you are looking for does not exist.',
    'error.offline.title': 'No Internet Connection',
    'error.offline.message': 'Please check your internet connection and try again.',
    'error.general.title': 'Something went wrong',
    'error.general.message': 'An unexpected error occurred. Please try again.',
    'error.goHome': 'Go Home',

    // Toast Messages
    'toast.success': 'Success',
    'toast.error': 'Error',
    'toast.warning': 'Warning',
    'toast.info': 'Information',

    // Application
    'app.title': 'CareBridge',
    'app.tagline': 'Healthcare Management System',

    // Form validation
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email address',
    'validation.minLength': 'Minimum {count} characters required',
    'validation.maxLength': 'Maximum {count} characters allowed',

    // Buttons
    'button.submit': 'Submit',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.delete': 'Delete',
    'button.edit': 'Edit',
    'button.add': 'Add',
    'button.close': 'Close',
    'button.back': 'Back',
    'button.next': 'Next',
    'button.previous': 'Previous',

    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',

    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.tomorrow': 'Tomorrow',
    'time.thisWeek': 'This Week',
    'time.lastWeek': 'Last Week',
    'time.nextWeek': 'Next Week',
  },
  fr: {
    // Auth
    'auth.login': 'Connexion',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.role': 'Rôle',
    'auth.admin': 'Administrateur',
    'auth.doctor': 'Médecin',
    'auth.signin': 'Se connecter',
    'signin': "Connectez-vous à votre compte",

    // Navigation
    'nav.home': 'Accueil',
    'nav.patients': 'Patients',
    'nav.reminders': 'Rappels',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    'nav.adminManagement': 'Gestion Admin',
    'nav.doctorManagement': 'Gestion Médecins',
    'nav.feedback': 'Commentaires',
    'nav.logs': 'Journaux',

    // Header
    'header.openMenu': 'Ouvrir le menu',
    'header.closeMenu': 'Fermer le menu',

    // Sidebar
    'sidebar.expandSidebar': 'Développer la barre latérale',
    'sidebar.collapseSidebar': 'Réduire la barre latérale',
    'sidebar.closeSidebar': 'Fermer la barre latérale',
    'common.error': 'Erreur',
    // Layout
    'layout.loading': 'Chargement...',

    // Dashboard
    'dashboard.welcome': 'Bienvenue sur CareBridge',
    'dashboard.patients': 'Patients',
    'dashboard.appointments': 'Rendez-vous',
    'dashboard.reminders': 'Rappels',
    'dashboard.medications': 'Médicaments',
    'dashboard.totalDoctors': 'Total Médecins',
    'dashboard.urgentFeedback': 'Commentaires Urgents',

    // Patients
    'patients.register': 'Enregistrer Nouveau Patient',
    'patients.viewAll': 'Voir Tous les Patients',
    'patients.name': 'Nom',
    'patients.age': 'Âge',
    'patients.phone': 'Téléphone',
    'patients.email': 'Email',
    'patients.address': 'Adresse',
    'patients.medicalHistory': 'Historique Médical',

    // Doctor Patients
    'doctor.patients.title': 'Patients',
    'doctor.patients.subtitle': 'Gérez les dossiers des patients',
    'doctor.patients.add': 'Ajouter un patient',
    'doctor.patients.first_name': 'Prénom',
    'doctor.patients.last_name': 'Nom',
    'doctor.patients.email': 'Email',
    'doctor.patients.phone_number': 'Numéro de téléphone',
    'doctor.patients.address': 'Adresse',
    'doctor.patients.language_preferences': 'Langue préférée',
    'doctor.patients.notification_preferences': 'Préférence de notification',
    'doctor.patients.submit': 'Soumettre',
    'doctor.patients.cancel': 'Annuler',
    'doctor.patients.success': 'Patient enregistré avec succès',
    'doctor.patients.error': "Échec de l'enregistrement du patient",
    'doctor.patients.department': 'Département',
    'doctor.patients.departments.outpatient': 'Consultation externe',
    'doctor.patients.departments.cardiology': 'Cardiologie',
    'doctor.patients.departments.emergency': 'Urgences',
    'doctor.patients.departments.radiology': 'Radiologie',
    'doctor.patients.departments.pediatrics': 'Pédiatrie',
    'doctor.patients.departments.oncology': 'Oncologie',
    'doctor.patients.toast.success': 'Succès',
    'doctor.patients.toast.error': 'Erreur',
    'doctor.patients.validation.required': 'Veuillez remplir tous les champs requis',
    'doctor.patients.validation.phone_number_invalid': 'Le numéro de téléphone doit comporter exactement 9 chiffres.',
    'doctor.patients.validation.password_too_short': 'Le mot de passe doit contenir au moins 8 caractères.',
    'doctor.patients.noPatients': "Aucun patient trouvé",

    // Reminders
    'reminders.appointment': 'Rappel de Rendez-vous',
    'reminders.medication': 'Horaire Médicament',
    'reminders.custom': 'Rappel Personnalisé',
    'reminders.noReminders': 'Aucun rappel trouvé',
    'reminders.create': 'Créer Nouveau Rappel',
    'reminders.all': 'Tous',

    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.actions': 'Actions',
    'common.success': 'Succès',
    'common.loading': 'Chargement...',
    'common.close': 'Fermer',

    // Settings
    'settings.profileUpdated': 'Profil mis à jour avec succès',
    'settings.passwordMismatch': 'Les mots de passe ne correspondent pas',

    // Errors
    'error.404.title': 'Page Non Trouvée',
    'error.404.message': 'La page que vous recherchez n\'existe pas.',
    'error.offline.title': 'Pas de Connexion Internet',
    'error.offline.message': 'Veuillez vérifier votre connexion internet et réessayer.',
    'error.general.title': 'Quelque chose s\'est mal passé',
    'error.general.message': 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    'error.goHome': 'Accueil',

    // Toast Messages
    'toast.success': 'Succès',
    'toast.error': 'Erreur',
    'toast.warning': 'Avertissement',
    'toast.info': 'Information',

    // Application
    'app.title': 'CareBridge',
    'app.tagline': 'Système de Gestion de Santé',

    // Form validation
    'validation.required': 'Ce champ est requis',
    'validation.email': 'Veuillez saisir une adresse email valide',
    'validation.minLength': 'Minimum {count} caractères requis',
    'validation.maxLength': 'Maximum {count} caractères autorisés',

    // Buttons
    'button.submit': 'Soumettre',
    'button.cancel': 'Annuler',
    'button.save': 'Enregistrer',
    'button.delete': 'Supprimer',
    'button.edit': 'Modifier',
    'button.add': 'Ajouter',
    'button.close': 'Fermer',
    'button.back': 'Retour',
    'button.next': 'Suivant',
    'button.previous': 'Précédent',

    // Status
    'status.active': 'Actif',
    'status.inactive': 'Inactif',
    'status.pending': 'En attente',
    'status.completed': 'Terminé',
    'status.cancelled': 'Annulé',

    // Time
    'time.today': 'Aujourd\'hui',
    'time.yesterday': 'Hier',
    'time.tomorrow': 'Demain',
    'time.thisWeek': 'Cette Semaine',
    'time.lastWeek': 'Semaine Dernière',
    'time.nextWeek': 'Semaine Prochaine',
  }
};

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('carebridge-language');
    return saved || 'en';
  });

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'fr' : 'en';
    setLanguage(newLang);
    localStorage.setItem('carebridge-language', newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
