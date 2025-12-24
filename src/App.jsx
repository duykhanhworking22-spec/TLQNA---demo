import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import QuestionList from './components/QuestionList'
import Profile from './components/Profile'
import NewQuestion from './components/NewQuestion'
import QuestionDetail from './components/QuestionDetail'
import FAQ from './components/FAQ'
import QuestionBank from './components/QuestionBank'
import CVHTSidebar from './components/CVHTSidebar'
import CVHTDashboard from './components/CVHTDashboard'
import PendingQuestions from './components/PendingQuestions'
import ProcessingQuestions from './components/ProcessingQuestions'
import CVHTReports from './components/CVHTReports'
import Login from './components/Login'
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationContainer from './components/NotificationContainer'
import AdminReports from './components/AdminReports'
import MobileNavbar from './components/MobileNavbar'
import './App.css'

function App() {
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [navigationParams, setNavigationParams] = useState({});

  useEffect(() => {
    // Check local storage for auth
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      setUserRole(role);

      // Restore state
      const savedPage = localStorage.getItem('currentPage');
      const savedPreviousPage = localStorage.getItem('previousPage');
      const savedQuestionId = localStorage.getItem('selectedQuestionId');

      // Try to restore params if possible (simplified for now)
      const savedParams = localStorage.getItem('navigationParams');
      if (savedParams) {
        try {
          setNavigationParams(JSON.parse(savedParams));
        } catch (e) { }
      }

      if (savedPage) setCurrentPage(savedPage);
      else if (role === 'cvht') setCurrentPage('pending');
      else if (role === 'admin') setCurrentPage('admin-reports');
      else setCurrentPage('my-question');

      if (savedPreviousPage) setPreviousPage(savedPreviousPage);
      if (savedQuestionId) setSelectedQuestionId(savedQuestionId);

    } else {
      const path = window.location.pathname;
      if (path.startsWith('/cvht')) setUserRole('cvht');
      else if (path.startsWith('/admin')) setUserRole('admin');
      else if (path.startsWith('/sinhvien')) setUserRole('student');
    }
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.removeItem('previousPage');
    localStorage.removeItem('selectedQuestionId');
    localStorage.removeItem('navigationParams');

    if (role === 'cvht') {
      setCurrentPage('pending');
      localStorage.setItem('currentPage', 'pending');
      window.history.pushState(null, '', '/cvht');
    } else if (role === 'admin') {
      setCurrentPage('admin-reports');
      localStorage.setItem('currentPage', 'admin-reports');
      window.history.pushState(null, '', '/admin');
    } else {
      setCurrentPage('my-question');
      localStorage.setItem('currentPage', 'my-question');
      window.history.pushState(null, '', '/sinhvien');
    }
  };

  const handleNavigate = (page, params = {}) => {
    let newPrevPage = previousPage;
    if (page === 'question-detail') {
      newPrevPage = currentPage;
      setPreviousPage(currentPage);
      localStorage.setItem('previousPage', currentPage); // Save prev page
    }

    // Store generic params
    setNavigationParams(params);
    localStorage.setItem('navigationParams', JSON.stringify(params));

    setCurrentPage(page);
    localStorage.setItem('currentPage', page); // Save current page

    if (params.id) {
      setSelectedQuestionId(params.id);
      localStorage.setItem('selectedQuestionId', params.id); // Save question ID
    }
  };

  const renderContent = () => {
    if (!userRole) {
      return <Login onLogin={() => {
        const role = localStorage.getItem('role');
        if (role) handleLogin(role);
      }} />;
    }

    if (userRole === 'admin') {
      return <AdminReports onNavigate={handleNavigate} />;
    }

    if (userRole === 'cvht') {
      switch (currentPage) {
        case 'profile':
          return <Profile userRole={userRole} />;
        case 'pending-questions': // Match Sidebar keys if possible, or mapping
        case 'pending':
          return <PendingQuestions onNavigate={handleNavigate} />;
        case 'processing-questions':
        case 'processing':
          return <ProcessingQuestions onNavigate={handleNavigate} />;
        case 'knowledge':
          return <FAQ />;
        case 'reports':
          return <CVHTReports />;
        case 'question-detail': // Added: Detail view for CVHT
          return <QuestionDetail
            questionId={selectedQuestionId}
            onBack={() => handleNavigate(previousPage || 'pending')} // Back to default list
          />;
        default:
          return <PendingQuestions onNavigate={handleNavigate} />;
      }
    }

    // Student View
    switch (currentPage) {
      case 'profile':
        return <Profile userRole={userRole} />;
      case 'new-question':
        return <NewQuestion onNavigate={handleNavigate} />;
      case 'question-bank':
        return <QuestionBank onNavigate={handleNavigate} initialSearch={navigationParams.search} />;
      case 'question-detail':
        return <QuestionDetail
          questionId={selectedQuestionId}
          onBack={() => handleNavigate(previousPage || 'my-question')}
        />;
      case 'dashboard':
        return <div style={{ padding: '2rem', color: '#1e293b' }}><h2>Trang Tổng quan (Đang cập nhật)</h2></div>;
      case 'faq':
        return <FAQ />;
      case 'my-question':
      default:
        return <QuestionList onNavigate={handleNavigate} />;
    }
  };


  return (
    <NotificationProvider>
      <div className="app-container">
        {userRole && userRole !== 'admin' && (
          userRole === 'cvht' ? (
            <CVHTSidebar activePage={currentPage} onNavigate={handleNavigate} />
          ) : (
            <Sidebar activePage={currentPage} onNavigate={handleNavigate} />
          )
        )}

        {renderContent()}
      </div>

      {/* Mobile Navigation Bar (Visible only on small screens via CSS) */}
      {userRole && (
        <MobileNavbar activePage={currentPage} onNavigate={handleNavigate} userRole={userRole} />
      )}

      <NotificationContainer />
    </NotificationProvider>
  )
}

export default App
