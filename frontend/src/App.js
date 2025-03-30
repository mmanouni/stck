import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Corrected import
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes> {/* Replace Switch with Routes */}
        <Route path="/" element={
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        } />
        <Route path="/profile" element={
          <ErrorBoundary>
            <Profile />
          </ErrorBoundary>
        } />
      </Routes>
    </Router>
  );
}

export default App;
