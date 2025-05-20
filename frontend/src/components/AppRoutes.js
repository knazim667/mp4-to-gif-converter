import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your page components from the 'pages' directory
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import HelpFAQPage from '../pages/HelpFAQPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import GuideMP4ToGIF from '../pages/GuideMP4ToGIF';
import GuideAddTextToGIF from '../pages/GuideAddTextToGIF';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help/faq" element={<HelpFAQPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/guides/how-to-convert-mp4-to-gif" element={<GuideMP4ToGIF />} />
      <Route path="/guides/adding-text-to-gifs" element={<GuideAddTextToGIF />} />
      {/* Add other routes for your application here */}
    </Routes>
  );
}

export default AppRoutes;