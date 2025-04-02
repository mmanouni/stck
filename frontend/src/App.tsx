import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import InventoryPage from './pages/InventoryPage';
import Contracts from './pages/Contracts';
import Profile from './pages/Profile';
import ThemeSwitcher from './components/ThemeSwitcher';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeSwitcher>
        <Navbar />
        <Routes>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </ThemeSwitcher>
    </Router>
  );
};

export default App;
