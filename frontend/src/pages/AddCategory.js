import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, CircularProgress } from '@mui/material';

function AddCategory() {
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('/api/auth/categories', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => alert('Category added successfully'))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="name" label="Category Name" value={formData.name} onChange={handleChange} fullWidth />
      <TextField name="description" label="Description" value={formData.description} onChange={handleChange} fullWidth />
      <TextField
        name="permissions"
        label="Permissions (comma-separated)"
        value={formData.permissions.join(',')}
        onChange={(e) => setFormData({ ...formData, permissions: e.target.value.split(',') })}
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Add Category'}
      </Button>
    </form>
  );
}

export default AddCategory;
