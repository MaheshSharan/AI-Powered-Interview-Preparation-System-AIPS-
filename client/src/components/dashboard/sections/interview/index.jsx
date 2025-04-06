import { Routes, Route, Navigate } from 'react-router-dom';
import InterviewSetup from './InterviewSetup';
import VirtualInterview from './virtual/VirtualInterview';
import TechnicalInterview from './technical/TechnicalInterview';
import HRInterview from './hr/HRInterview';

const Interview = () => {
  return (
    <Routes>
      <Route index element={<InterviewSetup />} />
      <Route path="setup" element={<InterviewSetup />} />
      <Route path="virtual" element={<VirtualInterview />} />
      <Route path="technical" element={<TechnicalInterview />} />
      <Route path="hr" element={<HRInterview />} />
      <Route path="*" element={<Navigate to="setup" replace />} />
    </Routes>
  );
};

export default Interview;
