import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
  });
  const [loading, setLoading] = useState(false); // Add loading state
  const [language, setLanguage] = useState('en'); // Add language state

  useEffect(() => {
    setLoading(true); // Start loading
    axios.get(`/api/inventory/${id}`)
      .then(response => setFormData(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false)); // Stop loading
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/inventory/${id}`, formData)
      .then(() => {
        alert('Product updated!');
        navigate('/');
      })
      .catch(error => console.error(error));
  };

  const cancelEdit = () => {
    navigate('/inventory');
  };

  return (
    <form onSubmit={handleSubmit} style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
          <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
          <input name="price" placeholder="Price" type="number" value={formData.price} onChange={handleChange} />
          <input name="quantity" placeholder="Quantity" type="number" value={formData.quantity} onChange={handleChange} />
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
          <button type="submit">Update Product</button>
          <button type="button" onClick={cancelEdit}>Cancel</button>
        </>
      )}
    </form>
  );
}

export default EditProduct;
