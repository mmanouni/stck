import React, { useState, useEffect } from 'react';
import { Button, createTheme, ThemeProvider } from '@mui/material';
import { CssBaseline } from '@mui/material';

function ThemeSwitcher({ children }) {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Button variant="contained" onClick={toggleTheme}>
        Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Theme
      </Button>
      {children}
    </ThemeProvider>
  );
}

export default ThemeSwitcher;
