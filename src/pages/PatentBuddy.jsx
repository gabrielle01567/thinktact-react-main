import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatentBuddyHome from './PatentBuddyHome';
import { PatentApplicationWizard } from './PatentAudit';

export default function PatentBuddy() {
  return (
    <Routes>
      <Route index element={<PatentBuddyHome />} />
      <Route path="wizard/*" element={<PatentApplicationWizard />} />
    </Routes>
  );
} 