import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Link,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Logo and Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="img"
                src="https://media.licdn.com/dms/image/v2/C510BAQE9vzMx9LndWw/company-logo_200_200/company-logo_200_200/0/1631351224335?e=2147483647&v=beta&t=gWxyPJA3rLsVaRBS9EuGzsWZOH1Wfi46yJZPqP7ng2g"
                alt="Rishabh Instruments Logo"
                sx={{
                  height: 32,
                  width: 32,
                  borderRadius: 1,
                  mr: 1.5
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight={600} color="primary">
                  RISHABH Instruments
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Global Energy Efficiency Solutions
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Manufacturing Management System designed for efficiency and precision.
            </Typography>
          </Grid>

          {/* Developer Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Custom Development Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon fontSize="small" />
                Need a similar system for your business?
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="primary" />
                <Link href="tel:+919699636055" color="inherit" underline="hover">
                  +91 9699636055
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" color="primary" />
                <Link href="mailto:samarthkasar9924@gmail.com" color="inherit" underline="hover">
                  samarthkasar9924@gmail.com
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* System Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              System Features
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                • Material Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Project Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Preventive Maintenance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Task Monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • BOM Management
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Copyright and Credits */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} RISHABH Instruments. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manufacturing Management System v1.0
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Developed by:
            </Typography>
            <Chip
              label="Samarth Kasar"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                component={Link}
                href="tel:+919699636055"
                color="primary"
                title="Call Developer"
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                component={Link}
                href="mailto:samarthkasar9924@gmail.com"
                color="primary"
                title="Email Developer"
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
