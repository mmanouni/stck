import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const sanitizeInput = (input) => input.replace(/[^a-zA-Z0-9@._-]/g, ''); // Allow special characters

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: sanitizeInput(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      alert('Username and password are required.');
      return;
    }
    if (formData.username.length < 3 || formData.password.length < 6) {
      alert('Username must be at least 3 characters and password at least 6 characters.');
      return;
    }
    axios
      .post('/api/auth/login', formData)
      .then((response) => {
        localStorage.setItem('csrfToken', response.data.csrfToken); // Store CSRF token
        document.cookie = `token=${response.data.token}; Secure; SameSite=Strict`;
        navigate('/');
      })
      .catch((error) => alert('Login failed: ' + (error.response?.data?.error || 'Unknown error')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
