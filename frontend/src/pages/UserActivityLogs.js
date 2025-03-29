import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';

function UserActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [userAgentFilter, setUserAgentFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [activityAnalytics, setActivityAnalytics] = useState([]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleUserAgentFilterChange = (e) => {
    setUserAgentFilter(e.target.value);
  };

  const handleUserIdFilterChange = (e) => {
    setUserIdFilter(e.target.value);
  };

  useEffect(() => {
    setLoading(true);
    axios.get('/api/user-activity-logs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      params: { action: filter, userAgent: userAgentFilter, userId: userIdFilter },
    })
      .then(response => setLogs(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, [filter, userAgentFilter, userIdFilter]);

  useEffect(() => {
    axios.get('/api/user-activity-logs/analytics')
      .then(response => setActivityAnalytics(response.data))
      .catch(error => console.error(error));
  }, []);

  const activityAnalyticsData = {
    labels: activityAnalytics.map(activity => activity._id),
    datasets: [
      {
        label: 'User Actions',
        data: activityAnalytics.map(activity => activity.count),
        backgroundColor: '#FF6384',
      },
    ],
  };

  return (
    <div>
      <h1>User Activity Logs</h1>
      <TextField
        label="Filter by Action"
        variant="outlined"
        value={filter}
        onChange={handleFilterChange}
        style={{ marginBottom: '20px' }}
      />
      <TextField
        label="Filter by User Agent"
        variant="outlined"
        value={userAgentFilter}
        onChange={handleUserAgentFilterChange}
        style={{ marginBottom: '20px' }}
      />
      <TextField
        label="Filter by User ID"
        variant="outlined"
        value={userIdFilter}
        onChange={handleUserIdFilterChange}
        style={{ marginBottom: '20px' }}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Typography variant="h6">User Actions</Typography>
            <Bar data={activityAnalyticsData} />
          </div>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User Agent</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log._id}>
                    <TableCell>{log.userId?.username || 'Unknown'}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.userAgent || 'Unknown'}</TableCell>
                    <TableCell>{log.category || 'Uncategorized'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
}

export default UserActivityLogs;
