import React from 'react';
import ReactDOM from 'react-dom/client'; // Update import for React 18
import App from './App';
import { Grid } from '@mui/material'; // Ensure correct import

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

<Grid container spacing={2}>
  <Grid xs={12} sm={6} md={4}>
    {/* ...existing code... */}
  </Grid>
</Grid>;

// Handle API errors
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

async function fetchInventoryStats() {
  try {
    const response = await axios.get(`${BASE_URL}/api/inventory/stats`);
    // ...existing code...
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
  }
}

async function fetchTransactionSummary() {
  try {
    const response = await axios.get(`${BASE_URL}/api/transactions/summary`);
    // ...existing code...
  } catch (error) {
    console.error('Error fetching transactions summary:', error);
  }
}