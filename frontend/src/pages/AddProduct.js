import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Box, Typography } from '@mui/material';

function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // Assuming language state is managed

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/inventory', formData)
      .then(() => alert('Product added!'))
      .catch(error => console.error(error));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: '',
    });
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input name="price" placeholder="Price" type="number" onChange={handleChange} />
      <input name="quantity" placeholder="Quantity" type="number" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <button type="submit">Add Product</button>
      <button type="button" onClick={resetForm}>Reset Form</button>
      <button type="button" onClick={handlePreview}>Preview Product</button>
      <Modal open={previewOpen} onClose={closePreview}>
        <Box sx={{ padding: 4, backgroundColor: 'white', margin: 'auto', marginTop: '10%', width: '50%' }}>
          <Typography variant="h6">Product Preview</Typography>
          <Typography>Name: {formData.name}</Typography>
          <Typography>Description: {formData.description}</Typography>
          <Typography>Price: ${formData.price}</Typography>
          <Typography>Quantity: {formData.quantity}</Typography>
          <Typography>Category: {formData.category}</Typography>
        </Box>
      </Modal>
    </form>
  );
}

export default AddProduct;
