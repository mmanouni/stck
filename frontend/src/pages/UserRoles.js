import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, Select, MenuItem, Button, Pagination, TextField, CircularProgress, Tooltip, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function UserRoles() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]); // New state for categories
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('username');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  const [language, setLanguage] = useState('en'); // New state for language
  const [isActiveFilter, setIsActiveFilter] = useState(''); // New state for isActive filter
  const [roleFilter, setRoleFilter] = useState(''); // New state for role filter
  const [categoryFilter, setCategoryFilter] = useState(''); // New state for category filter
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // New state for selected category IDs

  const roleDescriptions = {
    admin: 'Has full access to all features and settings.',
    user: 'Can view and manage their own data.',
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/auth/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      params: { page, sort, isActive: isActiveFilter, role: roleFilter, category: categoryFilter }, // Include filters
    })
      .then(response => {
        setUsers(response.data.users);
        setTotalPages(Math.ceil(response.data.total / response.data.limit));
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));

    axios.get('/api/auth/roles', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => setRoles(response.data))
      .catch(error => console.error(error));

    axios.get('/api/auth/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => setCategories(response.data))
      .catch(error => console.error(error));
  }, [page, sort, isActiveFilter, roleFilter, categoryFilter]);

  const handleRoleChange = (userId, newRole) => {
    axios.put(`/api/auth/users/${userId}/role`, { role: newRole }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        setUsers(users.map(user => (user._id === userId ? { ...user, role: newRole } : user)));
      })
      .catch(error => console.error(error));
  };

  const resetRole = (userId) => {
    axios.put(`/api/auth/users/${userId}/role`, { role: 'user' }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        setUsers(users.map(user => (user._id === userId ? { ...user, role: 'user' } : user)));
      })
      .catch(error => console.error(error));
  };

  const handleDeactivate = (userId) => {
    axios.put(`/api/auth/users/${userId}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        setUsers(users.map(user => (user._id === userId ? { ...user, isActive: false } : user)));
      })
      .catch(error => console.error(error));
  };

  const handleReactivate = (userId) => {
    axios.put(`/api/auth/users/${userId}/reactivate`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        setUsers(users.map(user => (user._id === userId ? { ...user, isActive: true } : user)));
      })
      .catch(error => console.error(error));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      axios.delete(`/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(() => {
          setUsers(users.filter(user => user._id !== userId));
          alert('User deleted successfully');
        })
        .catch(error => console.error(error));
    }
  };

  const handleAssignPermissions = (userId, categoryIds) => {
    axios.put(`/api/auth/users/${userId}/category-permissions`, { categoryIds }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => alert('Permissions assigned successfully'))
      .catch(error => console.error(error));
  };

  const handleRemovePermissions = (userId, categoryIds) => {
    axios.put(`/api/auth/users/${userId}/remove-category-permissions`, { categoryIds }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => alert('Permissions removed successfully'))
      .catch(error => console.error(error));
  };

  const handleDelegateRole = (userId, role, expiresAt) => {
    axios.put(`/api/auth/users/${userId}/delegate-role`, { role, expiresAt }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => alert('Role delegated successfully'))
      .catch(error => console.error(error));
  };

  const handleSuspendAccount = (userId) => {
    axios.put(`/api/auth/users/${userId}/suspend`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => alert('Account suspended successfully'))
      .catch(error => console.error(error));
  };

  const handleUnsuspendAccount = (userId) => {
    axios.put(`/api/auth/users/${userId}/unsuspend`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => alert('Account unsuspended successfully'))
      .catch(error => console.error(error));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleIsActiveFilterChange = (e) => {
    setIsActiveFilter(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <h1>User Roles</h1>
      {loading && <CircularProgress />}
      <TextField
        label="Search Users"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        style={{ marginBottom: '20px' }}
      />
      <TextField
        select
        label="Sort By"
        value={sort}
        onChange={handleSortChange}
        style={{ marginBottom: '20px' }}
      >
        <MenuItem value="username">Username</MenuItem>
        <MenuItem value="role">Role</MenuItem>
      </TextField>
      <TextField
        select
        label="Filter by Status"
        value={isActiveFilter}
        onChange={handleIsActiveFilterChange}
        style={{ marginBottom: '20px' }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="true">Active</MenuItem>
        <MenuItem value="false">Inactive</MenuItem>
      </TextField>
      <TextField
        select
        label="Filter by Role"
        value={roleFilter}
        onChange={handleRoleFilterChange}
        style={{ marginBottom: '20px' }}
      >
        <MenuItem value="">All</MenuItem>
        {roles.map(role => (
          <MenuItem key={role} value={role}>{role}</MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Filter by Category"
        value={categoryFilter}
        onChange={handleCategoryFilterChange}
        style={{ marginBottom: '20px' }}
      >
        <MenuItem value="">All</MenuItem>
        {categories.map(category => (
          <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
        ))}
      </TextField>
      <Grid container spacing={3}>
        {filteredUsers.length === 0 ? (
          <Typography style={{ margin: '20px auto' }}>No Users Found</Typography>
        ) : (
          filteredUsers.map(user => (
            <Grid item xs={12} sm={6} md={4} key={user._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{user.username}</Typography>
                  <Tooltip title={roleDescriptions[user.role] || 'No description available'}>
                    <Typography>Role: {user.role}</Typography>
                  </Tooltip>
                  <Typography>Status: {user.isActive ? 'Active' : 'Inactive'}</Typography>
                  <Typography>Category: {user.category?.name || 'Uncategorized'}</Typography>
                  <Typography>Category Permissions:</Typography>
                  <ul>
                    {user.categoryPermissions.map(permission => (
                      <li key={permission._id}>{permission.name}</li>
                    ))}
                  </ul>
                  <Typography>Delegated Role: {user.delegatedRole || 'None'}</Typography>
                  <Typography>Delegation Expires At: {user.delegationExpiresAt ? new Date(user.delegationExpiresAt).toLocaleString() : 'N/A'}</Typography>
                  <Typography>Status: {user.isSuspended ? 'Suspended' : 'Active'}</Typography>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    fullWidth
                  >
                    {roles.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                  <Tooltip title="Reset this user's role to 'user'">
                    <Button color="error" onClick={() => resetRole(user._id)} fullWidth>
                      Reset Role
                    </Button>
                  </Tooltip>
                  <Button
                    color="error"
                    onClick={() => handleDeactivate(user._id)}
                    disabled={!user.isActive}
                    fullWidth
                  >
                    Deactivate
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => handleReactivate(user._id)}
                    disabled={user.isActive}
                    fullWidth
                  >
                    Reactivate
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDeleteUser(user._id)}
                    fullWidth
                  >
                    Delete User
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => handleAssignPermissions(user._id, selectedCategoryIds)}
                    fullWidth
                  >
                    Assign Permissions
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleRemovePermissions(user._id, selectedCategoryIds)}
                    fullWidth
                  >
                    Remove Permissions
                  </Button>
                  <Button
                    onClick={() => handleDelegateRole(user._id, 'manager', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
                    fullWidth
                  >
                    Delegate Manager Role (1 Week)
                  </Button>
                  <Button
                    onClick={() => handleSuspendAccount(user._id)}
                    disabled={user.isSuspended}
                    fullWidth
                  >
                    Suspend Account
                  </Button>
                  <Button
                    onClick={() => handleUnsuspendAccount(user._id)}
                    disabled={!user.isSuspended}
                    fullWidth
                  >
                    Unsuspend Account
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Pagination count={totalPages} page={page} onChange={handlePageChange} />
    </div>
  );
}

export default UserRoles;
