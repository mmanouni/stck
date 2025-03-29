import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit">Dashboard</Button>
        <Button color="inherit">Profile</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
