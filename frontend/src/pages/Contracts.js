import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, CircularProgress } from '@mui/material';

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await axios.get('/api/contracts');
      setContracts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4">Contracts</Typography>
      {contracts.map((contract) => (
        <div key={contract._id}>
          <Typography variant="h6">{contract.name}</Typography>
          <Typography>{contract.details}</Typography>
        </div>
      ))}
    </div>
  );
}

export default Contracts;
