import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';

function LicenseActivation() {
  const [licenseKey, setLicenseKey] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [message, setMessage] = useState('');
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en'); // Assuming language state is added

  useEffect(() => {
    fetchLicenseStatus();
  }, []);

  const fetchLicenseStatus = () => {
    setLoading(true);
    axios
      .get('/api/license/validate', { params: { key: licenseKey, hardwareId } })
      .then((response) => setLicenseStatus(response.data))
      .catch(() => setLicenseStatus(null))
      .finally(() => setLoading(false));
  };

  const handleAction = (action) => {
    setLoading(true);
    axios
      .post(`/api/license/${action}`, { key: licenseKey, hardwareId })
      .then((response) => {
        setMessage(response.data.message);
        fetchLicenseStatus();
      })
      .catch((error) => setMessage(error.response?.data?.error || 'An error occurred'))
      .finally(() => setLoading(false));
  };

  return (
    <Grid container spacing={3} justifyContent="center" style={{ marginTop: '20px', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <Grid item xs={12} sm={8} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginBottom: '20px' }}>
              License Management
            </Typography>
            <TextField
              fullWidth
              label="License Key"
              variant="outlined"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              style={{ marginBottom: '20px' }}
            />
            <TextField
              fullWidth
              label="Hardware ID"
              variant="outlined"
              value={hardwareId}
              onChange={(e) => setHardwareId(e.target.value)}
              style={{ marginBottom: '20px' }}
            />
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleAction('activate')}
                  disabled={loading}
                  style={{ padding: '10px 0' }}
                >
                  Activate
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleAction('deactivate')}
                  disabled={loading}
                  style={{ padding: '10px 0' }}
                >
                  Deactivate
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={() => handleAction('renew')}
                  disabled={loading}
                  style={{ padding: '10px 0' }}
                >
                  Renew
                </Button>
              </Grid>
            </Grid>
            {loading && <CircularProgress style={{ marginTop: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />}
            {message && (
              <Typography variant="body1" color="error" style={{ marginTop: '20px', textAlign: 'center' }}>
                {message}
              </Typography>
            )}
            {licenseStatus && (
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <Typography variant="body1">
                  <strong>Status:</strong> {licenseStatus.valid ? 'Active' : 'Inactive'}
                </Typography>
                {licenseStatus.expiresAt && (
                  <Typography variant="body1">
                    <strong>Expires At:</strong> {new Date(licenseStatus.expiresAt).toLocaleString()}
                  </Typography>
                )}
                <Typography variant="body1">
                  <strong>Usage:</strong> {licenseStatus.usageCount}/{licenseStatus.maxUsage}
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default LicenseActivation;
