import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import Layout from './components/layout/Layout';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import CommunityList from './components/community/CommunityList';
import CommunityDetail from './components/community/CommunityDetail';
import CommunityForm from './components/community/CommunityForm';
import ChannelForm from './components/community/ChannelForm';
import MessagesPage from './pages/MessagesPage';
import JobList from './components/jobs/JobList';
import JobDetail from './components/jobs/JobDetail';
import JobForm from './components/jobs/JobForm';
import ResourceList from './components/resources/ResourceList';
import ResourceDetail from './components/resources/ResourceDetail';
import ResourceForm from './components/resources/ResourceForm';
import NotificationList from './components/notifications/NotificationList';
import ProfileSettings from './components/profile/ProfileSettings';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="communities" element={<CommunityList />} />
          <Route path="community/:id" element={<CommunityDetail />} />
          <Route path="create-community" element={<CommunityForm />} />
          <Route path="community/:id/create-channel" element={<ChannelForm />} />
          
          <Route path="messages" element={<MessagesPage />} />
          
          <Route path="jobs" element={<JobList />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="jobs/create" element={<JobForm />} />
          <Route path="jobs/edit/:id" element={<JobForm />} />
          
          <Route path="resources" element={<ResourceList />} />
          <Route path="resources/:id" element={<ResourceDetail />} />
          <Route path="resources/create" element={<ResourceForm />} />
          <Route path="resources/edit/:id" element={<ResourceForm />} />
          
          <Route path="notifications" element={<NotificationList />} />
          <Route path="settings" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;