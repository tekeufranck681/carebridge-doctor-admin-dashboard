import React from 'react';

export const SEOHead = ({ 
  title, 
  description, 
  keywords,
  ogTitle,
  ogDescription,
  ogImage = "/carebridge-og-image.png",
  canonical
}) => {
  const fullTitle = title ? `${title} - CareBridge` : 'CareBridge - Healthcare Management System';
  const defaultDescription = description || 'Comprehensive healthcare management platform for doctors, admins, and patients. Streamline patient care, manage feedback, and enhance healthcare delivery with CareBridge.';
  const defaultKeywords = keywords || 'healthcare management, patient care, medical software, doctor dashboard, healthcare feedback, patient management system';

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={defaultKeywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || defaultDescription} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:title" content={ogTitle || fullTitle} />
      <meta property="twitter:description" content={ogDescription || defaultDescription} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
    </>
  );
};