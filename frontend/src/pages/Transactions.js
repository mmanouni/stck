import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Pie, Bar } from 'react-chartjs-2';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', category: '' });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [summary, setSummary] = useState([]);
  const [yearlySummary, setYearlySummary] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en'); // Add language state

  useEffect(() => {
    setLoading(true);
    axios.get('/api/transactions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => setTransactions(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchYearlySummary();
    fetchCategorySummary();
  }, []);

  const fetchSummary = () => {
    setLoading(true);
    axios.get('/api/transactions/summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => setSummary(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const fetchYearlySummary = () => {
    axios.get('/api/transactions/yearly-summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => setYearlySummary(response.data))
      .catch(error => console.error(error));
  };

  const fetchCategorySummary = () => {
    axios.get('/api/transactions/category-summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => setCategorySummary(response.data))
      .catch(error => console.error(error));
  };

  const filterByDate = () => {
    axios.get('/api/transactions/filter', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      params: { startDate, endDate },
    })
      .then(response => setTransactions(response.data))
      .catch(error => console.error(error));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (isNaN(formData.amount) || formData.amount <= 0) {
      alert('Amount must be a positive number.');
      return;
    }
    axios.post('/api/transactions', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => {
        setTransactions([response.data, ...transactions]);
        setOpen(false);
        setFormData({ type: 'income', amount: '', description: '', category: '' });
      })
      .catch(error => console.error(error));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTransactions(transactions.filter((transaction) => transaction._id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction.');
    }
  };

  const incomeExpenseChartData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [
          transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const incomeExpenseBarChartData = {
    labels: transactions.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Income',
        data: transactions.filter(t => t.type === 'income').map(t => t.amount),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Expense',
        data: transactions.filter(t => t.type === 'expense').map(t => t.amount),
        backgroundColor: '#FF6384',
      },
    ],
  };

  return (
    <div style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <h1>{language === 'ar' ? 'المعاملات' : 'Transactions'}</h1>
      {loading && <CircularProgress />}
      <div style={{ marginBottom: '20px' }}>
        <Pie data={incomeExpenseChartData} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Bar data={incomeExpenseBarChartData} />
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <DatePicker
          label={language === 'ar' ? 'تاريخ البدء' : 'Start Date'}
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
        />
        <DatePicker
          label={language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
        />
        <Button variant="contained" onClick={filterByDate}>
          {language === 'ar' ? 'تصفية حسب التاريخ' : 'Filter by Date'}
        </Button>
      </div>
      <h2>{language === 'ar' ? 'الملخص الشهري' : 'Monthly Summary'}</h2>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{language === 'ar' ? 'الشهر' : 'Month'}</TableCell>
              <TableCell>{language === 'ar' ? 'إجمالي الدخل' : 'Total Income'}</TableCell>
              <TableCell>{language === 'ar' ? 'إجمالي المصاريف' : 'Total Expense'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item._id}</TableCell>
                <TableCell>{item.totalIncome.toFixed(2)} DZD</TableCell>
                <TableCell>{item.totalExpense.toFixed(2)} DZD</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h2>{language === 'ar' ? 'الملخص السنوي' : 'Yearly Summary'}</h2>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{language === 'ar' ? 'السنة' : 'Year'}</TableCell>
              <TableCell>{language === 'ar' ? 'إجمالي الدخل' : 'Total Income'}</TableCell>
              <TableCell>{language === 'ar' ? 'إجمالي المصاريف' : 'Total Expense'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {yearlySummary.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item._id}</TableCell>
                <TableCell>{item.totalIncome.toFixed(2)} DZD</TableCell>
                <TableCell>{item.totalExpense.toFixed(2)} DZD</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h2>{language === 'ar' ? 'ملخص الفئات' : 'Category Summary'}</h2>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{language === 'ar' ? 'الفئة' : 'Category'}</TableCell>
              <TableCell>{language === 'ar' ? 'إجمالي الدخل' : 'Total Income'}</TableCell>
              <TableCell>{language === 'ar' ? 'إجمالي المصاريف' : 'Total Expense'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categorySummary.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item._id}</TableCell>
                <TableCell>{item.totalIncome.toFixed(2)} DZD</TableCell>
                <TableCell>{item.totalExpense.toFixed(2)} DZD</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" onClick={() => setOpen(true)}>{language === 'ar' ? 'إضافة معاملة' : 'Add Transaction'}</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{language === 'ar' ? 'إضافة معاملة' : 'Add Transaction'}</DialogTitle>
        <DialogContent>
          <TextField name="type" label={language === 'ar' ? 'النوع' : 'Type'} select value={formData.type} onChange={handleChange} fullWidth>
            <option value="income">{language === 'ar' ? 'دخل' : 'Income'}</option>
            <option value="expense">{language === 'ar' ? 'مصاريف' : 'Expense'}</option>
          </TextField>
          <TextField name="amount" label={language === 'ar' ? 'المبلغ' : 'Amount'} type="number" value={formData.amount} onChange={handleChange} fullWidth />
          <TextField name="description" label={language === 'ar' ? 'الوصف' : 'Description'} value={formData.description} onChange={handleChange} fullWidth />
          <TextField name="category" label={language === 'ar' ? 'الفئة' : 'Category'} value={formData.category} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={handleSubmit}>{language === 'ar' ? 'إضافة' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{language === 'ar' ? 'النوع' : 'Type'}</TableCell>
              <TableCell>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableCell>
              <TableCell>{language === 'ar' ? 'الوصف' : 'Description'}</TableCell>
              <TableCell>{language === 'ar' ? 'الفئة' : 'Category'}</TableCell>
              <TableCell>{language === 'ar' ? 'التاريخ' : 'Date'}</TableCell>
              <TableCell>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {language === 'ar' ? 'لم يتم العثور على معاملات' : 'No Transactions Found'}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(transaction => (
                <TableRow key={transaction._id}>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.amount} DZD</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => handleDelete(transaction._id)}>{language === 'ar' ? 'حذف' : 'Delete'}</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Transactions;
