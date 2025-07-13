import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Person,
} from '@mui/icons-material';

import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    switch (path) {
      case 'dashboard':
        return 'Dashboard';
      case 'materials':
        return 'Materials Management';
      case 'bom':
        return 'Bill of Materials';
      case 'projects':
        return 'Project Tracking';
      case 'maintenance':
        return 'Preventive Maintenance';
      case 'tasks':
        return 'Task Monitoring';
      default:
        return 'Rishabh Instruments';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'operator':
        return 'primary';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={onMenuClick}
        sx={{ mr: 2, display: { lg: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      {/* Logo and Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
        <Box
          component="img"
          src="https://media.licdn.com/dms/image/v2/C510BAQE9vzMx9LndWw/company-logo_200_200/company-logo_200_200/0/1631351224335?e=2147483647&v=beta&t=gWxyPJA3rLsVaRBS9EuGzsWZOH1Wfi46yJZPqP7ng2g"
          alt="Company Logo"
          sx={{
            height: 40,
            width: 40,
            borderRadius: 1,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard')}
        />
        <Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Manufacturing Management System
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* User Department & Role */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Chip
            label={user?.department}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            label={user?.role?.toUpperCase()}
            size="small"
            color={getRoleColor(user?.role)}
          />
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Profile Menu */}
        <Tooltip title="Account">
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                fontSize: '1rem',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            maxWidth: 360,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        
        <MenuItem>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Low Stock Alert
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Material ABC-001 is running low
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Maintenance Due
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Machine XYZ-123 maintenance scheduled
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Task Overdue
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Project milestone deadline missed
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => navigate('/notifications')}>
          <Typography variant="body2" color="primary.main" fontWeight={500}>
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};

export default Header;
