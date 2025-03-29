import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Grid, Typography } from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [inventoryStats, setInventoryStats] = useState({});
  const [transactionSummary, setTransactionSummary] = useState({});
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/inventory/stats'),
      axios.get('/api/transactions/summary'),
      axios.get('/api/inventory/category-stats'),
    ])
      .then(([inventoryRes, transactionRes, categoryRes]) => {
        setInventoryStats(inventoryRes.data);
        setTransactionSummary(transactionRes.data);
        setCategoryStats(categoryRes.data);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const inventoryPieData = {
    labels: ['Total Products', 'Total Stock Value'],
    datasets: [
      {
        data: [inventoryStats.totalProducts || 0, inventoryStats.totalStockValue || 0],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const categoryBarData = {
    labels: categoryStats.map(stat => stat._id),
    datasets: [
      {
        label: 'Products per Category',
        data: categoryStats.map(stat => stat.count),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const transactionBarData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        label: 'Transaction Summary',
        data: [transactionSummary.totalIncome || 0, transactionSummary.totalExpense || 0],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Inventory Overview</Typography>
            <Pie data={inventoryPieData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Transaction Summary</Typography>
            <Bar data={transactionBarData} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Products by Category</Typography>
            <Bar data={categoryBarData} />
          </Grid>
        </Grid>
      )}
    </div>
  );
}

export default Dashboard;
