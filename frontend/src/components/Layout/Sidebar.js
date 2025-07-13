import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ListAlt as ListAltIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Task as TaskIcon,
} from '@mui/icons-material';

import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: 'Materials',
    icon: <InventoryIcon />,
    path: '/materials',
  },
  {
    text: 'Bill of Materials',
    icon: <ListAltIcon />,
    path: '/bom',
  },
  {
    text: 'Project Tracking',
    icon: <AssignmentIcon />,
    path: '/projects',
  },
  {
    text: 'Preventive Maintenance',
    icon: <BuildIcon />,
    path: '/maintenance',
  },
  {
    text: 'Task Monitoring',
    icon: <TaskIcon />,
    path: '/tasks',
  },
];

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
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
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      {/* Logo and Company Info */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #B85494 0%, #8B3A6B 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mr: 2,
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            R
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              RISHABH
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Instruments
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
          Global Energy Efficiency Solution Company
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              mr: 1.5,
              fontSize: '0.875rem',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.department}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={user?.role?.toUpperCase()}
          size="small"
          color={getRoleColor(user?.role)}
          sx={{ fontSize: '0.6875rem' }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ py: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          © 2025 Rishabh Instruments
        </Typography>
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          Enterprise Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
