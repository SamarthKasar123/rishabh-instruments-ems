import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  DoneAll as DoneAllIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    getNotificationIcon,
    getNotificationColor,
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || notification.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  // Clear all filters function
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterSeverity('all');
  };

  // Group notifications by type for summary
  const notificationSummary = notifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {});

  const getTypeIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <InventoryIcon />;
      case 'overdue_maintenance':
        return <BuildIcon color="error" />;
      case 'upcoming_maintenance':
        return <ScheduleIcon color="info" />;
      case 'overdue_task':
        return <AssignmentIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const formatNotificationType = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with system alerts and important information
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh notifications">
            <IconButton onClick={fetchNotifications} disabled={isLoading}>
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button
                variant="outlined"
                startIcon={<DoneAllIcon />}
                onClick={markAllAsRead}
                size="small"
              >
                Mark All Read
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {notifications.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Notifications
                  </Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {unreadCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unread
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {notificationSummary.low_stock || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {notificationSummary.overdue_maintenance || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Maintenance
                  </Typography>
                </Box>
                <BuildIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Filter Notifications
            </Typography>
            {(searchTerm || filterType !== 'all' || filterSeverity !== 'all') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                helperText={`${filteredNotifications.length} of ${notifications.length} notifications`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types ({notifications.length})</MenuItem>
                  <MenuItem value="low_stock">
                    Low Stock ({notificationSummary.low_stock || 0})
                  </MenuItem>
                  <MenuItem value="overdue_maintenance">
                    Overdue Maintenance ({notificationSummary.overdue_maintenance || 0})
                  </MenuItem>
                  <MenuItem value="upcoming_maintenance">
                    Upcoming Maintenance ({notificationSummary.upcoming_maintenance || 0})
                  </MenuItem>
                  <MenuItem value="overdue_task">
                    Overdue Tasks ({notificationSummary.overdue_task || 0})
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filterSeverity}
                  label="Severity"
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Chip
                  label={`Showing ${filteredNotifications.length}`}
                  color="primary"
                  variant="outlined"
                />
                {unreadCount > 0 && (
                  <Chip
                    label={`${unreadCount} Unread`}
                    color="error"
                    size="small"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notifications ({filteredNotifications.length})
          </Typography>
          
          {filteredNotifications.length === 0 ? (
            <Box textAlign="center" py={4}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || filterType !== 'all' || filterSeverity !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You\'re all caught up! 🎉'
                }
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      border: !notification.isRead ? 2 : 1,
                      borderColor: !notification.isRead 
                        ? `${getNotificationColor(notification.severity)}.main`
                        : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: !notification.isRead ? 'action.hover' : 'transparent',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      p: 2,
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={2} width="100%">
                      <Avatar
                        sx={{
                          bgcolor: `${getNotificationColor(notification.severity)}.main`,
                          color: 'white',
                          mt: 0.5,
                        }}
                      >
                        {getTypeIcon(notification.type)}
                      </Avatar>
                      
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography
                            variant="body1"
                            fontWeight={!notification.isRead ? 600 : 400}
                            sx={{ lineHeight: 1.4 }}
                          >
                            {notification.message}
                          </Typography>
                          {!notification.isRead && (
                            <Chip
                              label="NEW"
                              size="small"
                              color="primary"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Box display="flex" gap={1}>
                            <Chip
                              label={formatNotificationType(notification.type)}
                              size="small"
                              color={getNotificationColor(notification.severity)}
                              variant="outlined"
                            />
                            <Chip
                              label={notification.severity.toUpperCase()}
                              size="small"
                              icon={getSeverityIcon(notification.severity)}
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {notification.timestamp.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {!notification.isRead && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            onClick={() => markAsRead(notification.id)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          >
                            <DoneAllIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Notifications;
