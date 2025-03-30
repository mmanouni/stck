import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Dialog, DialogContent, DialogActions } from '@mui/material';

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en'); // Add language state

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await axios.get('/api/contracts/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setContracts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id) => {
    setLoading(true);
    try {
      await axios.post(`/api/contracts/accept/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Contract accepted successfully');
      fetchContracts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <Typography variant="h4">Contracts</Typography>
      {contracts.map((contract) => (
        <div key={contract._id}>
          <Typography>Version: {contract.version}</Typography>
          <Typography>Changelog: {contract.changelog}</Typography>
          <Typography>Accepted By: {contract.acceptedBy?.username || 'Not Accepted'}</Typography>
          <Button onClick={() => setSelectedContract(contract)}>View</Button>
          {!contract.acceptedAt && (
            <Button onClick={() => handleAccept(contract._id)} disabled={loading}>
              Accept
            </Button>
          )}
        </div>
      ))}

      {selectedContract && (
        <Dialog open={true} onClose={() => setSelectedContract(null)}>
          <DialogContent>
            <Typography>Version: {selectedContract.version}</Typography>
            <Typography>Changelog: {selectedContract.changelog}</Typography>
            <Typography>Buyer Details:</Typography>
            <Typography>Company Name: {selectedContract.buyerDetails.companyName}</Typography>
            <Typography>Address: {selectedContract.buyerDetails.address}</Typography>
            <Typography>Representative Name: {selectedContract.buyerDetails.representativeName}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedContract(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default Contracts;
