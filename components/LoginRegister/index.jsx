import React, { useState } from 'react';
import { Button, TextField, Typography, Grid } from '@mui/material';
import axios from 'axios';

function LoginRegister({ onLogin }) {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    login_name: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    location: '',
    description: '',
    occupation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/admin/login', { login_name: loginName, password: loginPassword });
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post('/user', registerData);
      setSuccess('Registration successful');
      setRegisterData({
        login_name: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        location: '',
        description: '',
        occupation: ''
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setSuccess('');
    }
  };

  return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Login</Typography>
          <TextField
              label="Login Name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              fullWidth
              margin="normal"
          />
          <Button onClick={handleLogin} variant="contained" color="primary">
            Login
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Register</Typography>
          <TextField
              label="Login Name"
              name="login_name"
              value={registerData.login_name}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Password"
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Confirm Password"
              type="password"
              name="password_confirm"
              value={registerData.password_confirm}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="First Name"
              name="first_name"
              value={registerData.first_name}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Last Name"
              name="last_name"
              value={registerData.last_name}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Location"
              name="location"
              value={registerData.location}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Description"
              name="description"
              value={registerData.description}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Occupation"
              name="occupation"
              value={registerData.occupation}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
          />
          <Button onClick={handleRegister} variant="contained" color="secondary">
            Register Me
          </Button>
        </Grid>
        {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
        )}
        {success && (
            <Grid item xs={12}>
              <Typography color="success">{success}</Typography>
            </Grid>
        )}
      </Grid>
  );
}

export default LoginRegister;