import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import InventoryList from '../components/InventoryList';

jest.mock('axios');

describe('InventoryList Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        products: [
          { _id: '1', name: 'Product 1', price: 100, quantity: 10, category: 'Category 1' },
          { _id: '2', name: 'Product 2', price: 200, quantity: 5, category: 'Category 2' },
        ],
        total: 2,
        limit: 10,
      },
    });
  });

  it('should render the inventory list', async () => {
    render(<InventoryList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Product 1')).toBeInTheDocument());
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should filter products by category', async () => {
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Product 1')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Category 1' } });
    expect(axios.get).toHaveBeenCalledWith('/api/inventory/search?query=Category 1');
  });

  it('should handle search input', async () => {
    render(<InventoryList />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'Product' } });
    expect(axios.get).toHaveBeenCalledWith('/api/inventory/suggestions?query=Product');
  });
});
