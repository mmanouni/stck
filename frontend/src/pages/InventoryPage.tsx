import React, { useEffect, useState } from 'react';
import InventoryList from '../components/InventoryList';
import { inventoryApi, InventoryItem } from '../api/inventory';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await inventoryApi.getAll();
        setInventory(data);
      } catch (err) {
        setError('Failed to fetch inventory data');
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      <InventoryList inventory={inventory} />
    </Box>
  );
};

export default InventoryPage; 