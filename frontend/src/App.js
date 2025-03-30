import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import InventoryList from './pages/InventoryList';
import Contracts from './pages/Contracts';
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  return (
    <Router>
      <ThemeSwitcher>
        <Navbar />
        <Routes>
          <Route path="/" element={<InventoryList />} />
          <Route path="/contracts" element={<Contracts />} />
        </Routes>
      </ThemeSwitcher>
    </Router>
  );
}

export default App;
