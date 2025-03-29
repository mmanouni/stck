import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Pagination, List, ListItem, CircularProgress } from '@mui/material';
import { io } from 'socket.io-client';
import { DatePicker } from '@mui/x-date-pickers';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [realTimeLogs, setRealTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/audit-logs?page=${page}&action=${filter}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => {
        setLogs(response.data.logs);
        setTotalPages(Math.ceil(response.data.total / response.data.limit));
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => {
    const socket = io();
    socket.on('auditLogUpdate', (data) => {
      setRealTimeLogs(prevLogs => [data, ...prevLogs].slice(0, 10)); // Keep only the latest 10 logs
    });
    return () => socket.disconnect();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1); // Reset to the first page when filter changes
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleExport = () => {
    axios.get('/api/audit-logs/export', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'audit_logs.csv');
        document.body.appendChild(link);
        link.click();
      })
      .catch(error => console.error(error));
  };

  const handleDateFilter = () => {
    setLoading(true);
    axios.get(`/api/audit-logs?startDate=${startDate}&endDate=${endDate}`)
      .then(response => setLogs(response.data.logs))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h1>Audit Logs</h1>
      {loading && <CircularProgress />}
      <TextField
        label="Filter by Action"
        variant="outlined"
        value={filter}
        onChange={handleFilterChange}
        style={{ marginBottom: '20px' }}
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
        />
        <Button variant="contained" onClick={handleDateFilter}>
          Apply Filter
        </Button>
      </div>
      <Button variant="contained" onClick={handleExport} style={{ marginBottom: '20px' }}>
        Export Logs
      </Button>
      <h2>Real-Time Activity Feed</h2>
      <List>
        {realTimeLogs.map((log, index) => (
          <ListItem key={index}>
            {log.message}
          </ListItem>
        ))}
      </List>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Logs Found
                </TableCell>
              </TableRow>
            ) : (
              logs.map(log => (
                <TableRow key={log._id}>
                  <TableCell>{log.userId?.username || 'Unknown'}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination count={totalPages} page={page} onChange={handlePageChange} />
    </div>
  );
}

export default AuditLogs;
