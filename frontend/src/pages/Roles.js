import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';

function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

  const predefinedRoles = [
    { name: 'superadmin', description: 'Has full access to all features and settings.' },
    { name: 'admin', description: 'Can manage users, view reports, and oversee operations.' },
    { name: 'manager', description: 'Can manage inventory and oversee sellers and inventory clerks.' },
    { name: 'seller', description: 'Can sell products and view sales reports.' },
    { name: 'inventory_clerk', description: 'Can add and update product information in the inventory.' },
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    setLoading(true);
    axios.get('/api/roles', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => setRoles(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const initializeRoles = () => {
    axios.post('/api/roles/initialize', {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        alert('Predefined roles initialized successfully');
        fetchRoles();
      })
      .catch(error => console.error(error));
  };

  const handleOpen = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    axios.post('/api/roles', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        fetchRoles();
        handleClose();
      })
      .catch(error => console.error(error));
  };

  const handleUpdatePermissions = (roleId, permissions) => {
    axios.put(`/api/roles/${roleId}/permissions`, { permissions }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        alert('Permissions updated successfully');
        fetchRoles();
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h1>Roles</h1>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Permissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map(role => (
                <TableRow key={role._id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <TextField
                      value={role.permissions.join(',')}
                      onChange={(e) => handleUpdatePermissions(role._id, e.target.value.split(','))}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Button variant="contained" onClick={initializeRoles} style={{ marginRight: '10px' }}>
        Initialize Roles
      </Button>
      <Button variant="contained" onClick={handleOpen}>Add Role</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Role</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth />
          <TextField name="description" label="Description" value={formData.description} onChange={handleChange} fullWidth />
          <TextField
            name="permissions"
            label="Permissions (comma-separated)"
            value={formData.permissions.join(',')}
            onChange={(e) => setFormData({ ...formData, permissions: e.target.value.split(',') })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Roles;
