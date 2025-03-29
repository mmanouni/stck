import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Transactions from './Transactions';

jest.mock('axios');

describe('Transactions Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: [
        { _id: '1', type: 'income', amount: 500, description: 'Salary', category: 'Work' },
        { _id: '2', type: 'expense', amount: 200, description: 'Groceries', category: 'Food' },
      ],
    });
  });

  it('should render transactions', async () => {
    render(<Transactions />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Salary')).toBeInTheDocument());
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('should filter transactions by date', async () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText(/filter by date/i));
    expect(axios.get).toHaveBeenCalledWith('/api/transactions/filter', expect.any(Object));
  });

  it('should add a new transaction', async () => {
    axios.post.mockResolvedValue({
      data: { _id: '3', type: 'income', amount: 1000, description: 'Bonus', category: 'Work' },
    });
    render(<Transactions />);
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '1000' } });
    fireEvent.click(screen.getByText(/add/i));
    await waitFor(() => expect(screen.getByText('Bonus')).toBeInTheDocument());
  });
});
