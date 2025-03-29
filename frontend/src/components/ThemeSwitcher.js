import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

function ThemeSwitcher() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'light' ? '#fff' : '#121212';
    document.body.style.color = theme === 'light' ? '#000' : '#fff';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const switchTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button variant="contained" onClick={switchTheme}>
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
    </Button>
  );
}

export default ThemeSwitcher;
