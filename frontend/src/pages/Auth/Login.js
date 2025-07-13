import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Container,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B85494 0%, #8B3A6B 50%, #2D1B4E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={0} sx={{ minHeight: '80vh' }}>
          {/* Left Side - Company Info */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              p: 4,
            }}
          >
            <Box textAlign="center" sx={{ maxWidth: 400 }}>
              <Box
                component="img"
                src="https://media.licdn.com/dms/image/v2/C510BAQE9vzMx9LndWw/company-logo_200_200/company-logo_200_200/0/1631351224335?e=2147483647&v=beta&t=gWxyPJA3rLsVaRBS9EuGzsWZOH1Wfi46yJZPqP7ng2g"
                alt="Rishabh Instruments Logo"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  p: 2,
                  mb: 3,
                  mx: 'auto',
                  display: 'block'
                }}
              />
              
              <Typography variant="h3" fontWeight={700} gutterBottom>
                RISHABH
              </Typography>
              
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                Instruments Limited
              </Typography>
              
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Global Energy Efficiency Solution Company
              </Typography>
              
              <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
                Enterprise Management System for optimizing energy use and improving 
                operational efficiency across diverse industries.
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700}>
                    3000+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Global Customers
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700}>
                    270+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Dealers Worldwide
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700}>
                    145+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Product Lines
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={24}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: { xs: 0, md: '0 16px 16px 0' },
              }}
            >
              <Container maxWidth="sm" sx={{ py: 6 }}>
                <Box textAlign="center" mb={4}>
                  <Avatar
                    sx={{
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <LockIcon fontSize="large" />
                  </Avatar>
                  
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    Welcome Back
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary">
                    Sign in to access the Rishabh Instruments Enterprise System
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    autoFocus
                    sx={{ mb: 3 }}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    sx={{ mb: 4 }}
                    variant="outlined"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 3,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Demo Credentials
                  </Typography>
                </Divider>

                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Admin:</strong> admin@rishabh.co.in / admin123
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Manager:</strong> manager@rishabh.co.in / manager123
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Operator:</strong> operator@rishabh.co.in / operator123
                  </Typography>
                </Box>

                <Box textAlign="center" mt={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    © {new Date().getFullYear()} Rishabh Instruments Limited. All rights reserved.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    System developed by <strong>Samarth Kasar</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    📞 +91 9699636055 | ✉️ samarthkasar9924@gmail.com
                  </Typography>
                </Box>
              </Container>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
