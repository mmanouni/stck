import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField } from '@mui/material';

function UserActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // New state for filtering logs
  const [userAgentFilter, setUserAgentFilter] = useState(''); // New state for filtering by userAgent
  const [userIdFilter, setUserIdFilter] = useState(''); // New state for filtering by userId

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
      params: { action: filter, userAgent: userAgentFilter, userId: userIdFilter }, // Include userId filter
    })
      .then(response => setLogs(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, [filter, userAgentFilter, userIdFilter]);

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
      )}
    </div>
  );
}

export default UserActivityLogs;
