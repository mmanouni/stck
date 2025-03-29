import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pagination, TextField, Button, Modal, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, Input, CircularProgress, List, ListItem, Grid, Card, CardContent, IconButton } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

function InventoryList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // New state for view mode
  const [hasMore, setHasMore] = useState(true); // New state for infinite scrolling
  const [favorites, setFavorites] = useState([]); // New state for favorites
  const [language, setLanguage] = useState('en'); // New state for language

  useEffect(() => {
    setLoading(true);
    axios.get('/api/inventory')
      .then(response => {
        setProducts(response.data.products);
        const uniqueCategories = [...new Set(response.data.products.map(product => product.category))];
        setCategories(uniqueCategories);
        setTotalPages(Math.ceil(response.data.total / response.data.limit));
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/inventory?page=${page}`)
      .then(response => {
        setProducts(response.data.products);
        setTotalPages(Math.ceil(response.data.total / response.data.limit));
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, [page]);

  const handleSearch = () => {
    setLoading(true);
    axios.get(`/api/inventory/search?query=${searchQuery}`)
      .then(response => setProducts(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const handleSearchQueryChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      axios.get(`/api/inventory/suggestions?query=${query}`)
        .then(response => setSuggestions(response.data))
        .catch(error => console.error(error));
    } else {
      setSuggestions([]);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleDelete = (id) => {
    setDeleteProductId(id);
  };

  const confirmDelete = () => {
    setLoading(true);
    axios.delete(`/api/inventory/${deleteProductId}`)
      .then(() => {
        setProducts(products.filter(product => product._id !== deleteProductId));
        setDeleteProductId(null);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const cancelDelete = () => {
    setDeleteProductId(null);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setLoading(true);
    if (event.target.value === '') {
      axios.get('/api/inventory')
        .then(response => setProducts(response.data.products))
        .catch(error => console.error(error))
        .finally(() => setLoading(false));
    } else {
      axios.get(`/api/inventory/search?query=${event.target.value}`)
        .then(response => setProducts(response.data))
        .catch(error => console.error(error))
        .finally(() => setLoading(false));
    }
  };

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    axios.post('/api/inventory/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        alert('Products uploaded successfully');
        window.location.reload();
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const handleExport = () => {
    setLoading(true);
    axios.get('/api/inventory/export', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'inventory.csv');
        document.body.appendChild(link);
        link.click();
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const loadMoreProducts = () => {
    setLoading(true);
    axios.get(`/api/inventory?page=${page + 1}`)
      .then(response => {
        if (response.data.products.length === 0) {
          setHasMore(false);
        } else {
          setProducts([...products, ...response.data.products]);
          setPage(page + 1);
        }
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPage(1);
    setLoading(true);
    axios.get('/api/inventory')
      .then(response => setProducts(response.data.products))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const toggleFavorite = (productId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(productId)
        ? prevFavorites.filter((id) => id !== productId)
        : [...prevFavorites, productId]
    );
  };

  const filterFavorites = () => {
    setProducts(products.filter((product) => favorites.includes(product._id)));
  };

  const translate = (key) => {
    const translations = {
      inventory: language === 'ar' ? 'المخزون' : 'Inventory',
    };
    return translations[key] || key;
  };

  return (
    <div style={{ direction: language === 'ar' ? 'rtl' : 'ltr', padding: '20px' }}>
      <h1>{translate('inventory')}</h1>
      {loading && <CircularProgress />}
      {!loading && products.length === 0 && <Typography>No Products Found</Typography>}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <Button variant="contained" onClick={handleExport} style={{ marginRight: '10px' }}>
            Export to CSV
          </Button>
          <Input type="file" onChange={handleBulkUpload} />
        </div>
        <IconButton onClick={toggleViewMode}>
          {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
        </IconButton>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          displayEmpty
          variant="outlined"
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(category => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
        <Button variant="contained" onClick={filterFavorites}>Show Favorites</Button>
        <Button variant="outlined" onClick={clearFilters}>Clear Filters</Button>
      </div>
      {suggestions.length > 0 && (
        <List>
          {suggestions.map(suggestion => (
            <ListItem key={suggestion._id}>{suggestion.name}</ListItem>
          ))}
        </List>
      )}
      <Button variant="contained" onClick={handleSearch}>Search</Button>
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography>Quantity: {product.quantity}</Typography>
                  <Typography>Category: {product.category}</Typography>
                  <IconButton onClick={() => toggleFavorite(product._id)}>
                    {favorites.includes(product._id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Button variant="outlined" onClick={() => handleOpenModal(product)}>View Details</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <List>
          {products.map(product => (
            <ListItem key={product._id}>
              <Typography>{product.name} - {product.quantity} in stock</Typography>
              <IconButton onClick={() => toggleFavorite(product._id)}>
                {favorites.includes(product._id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
              <Button onClick={() => handleOpenModal(product)}>Details</Button>
            </ListItem>
          ))}
        </List>
      )}
      {hasMore && (
        <Button
          variant="contained"
          onClick={loadMoreProducts}
          style={{ marginTop: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Load More'}
        </Button>
      )}
      <Pagination count={totalPages} page={page} onChange={handlePageChange} />
      <Modal open={!!selectedProduct} onClose={handleCloseModal}>
        <Box sx={{ padding: 4, backgroundColor: 'white', margin: 'auto', marginTop: '10%', width: '50%' }}>
          {selectedProduct && (
            <>
              <Typography variant="h6">{selectedProduct.name}</Typography>
              <Typography>Description: {selectedProduct.description}</Typography>
              <Typography>Price: ${selectedProduct.price}</Typography>
              <Typography>Quantity: {selectedProduct.quantity}</Typography>
              <Typography>Category: {selectedProduct.category}</Typography>
            </>
          )}
        </Box>
      </Modal>
      <Dialog open={!!deleteProductId} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this product?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InventoryList;
