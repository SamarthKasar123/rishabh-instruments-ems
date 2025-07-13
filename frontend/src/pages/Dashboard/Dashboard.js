import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Assignment as ProjectIcon,
  Build as MaintenanceIcon,
  Task as TaskIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

import apiService from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);
  const [departmentWorkload, setDepartmentWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        activitiesRes,
        alertsRes,
        projectStatusRes,
        departmentRes,
      ] = await Promise.all([
        apiService.getDashboardOverview(),
        apiService.getRecentActivities(8),
        apiService.getAlerts(),
        apiService.getProjectStatus(),
        apiService.getDepartmentWorkload(),
      ]);

      setOverview(overviewRes.data);
      setRecentActivities(activitiesRes.data);
      setAlerts(alertsRes.data);
      setProjectStatus(projectStatusRes.data);
      setDepartmentWorkload(departmentRes.data);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project':
        return <ProjectIcon color="primary" />;
      case 'maintenance':
        return <MaintenanceIcon color="warning" />;
      case 'task':
        return <TaskIcon color="info" />;
      default:
        return <InventoryIcon color="success" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'project':
        return 'primary';
      case 'maintenance':
        return 'warning';
      case 'task':
        return 'info';
      default:
        return 'success';
    }
  };

  const COLORS = ['#B85494', '#8B3A6B', '#2D1B4E', '#E8B4D6', '#4A3468'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {getGreeting()}, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to your Rishabh Instruments dashboard. Here's what's happening today.
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {formatNumber(overview?.materials?.total || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Materials
                  </Typography>
                  {overview?.materials?.lowStock > 0 && (
                    <Chip
                      label={`${overview.materials.lowStock} Low Stock`}
                      size="small"
                      color="warning"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {formatNumber(overview?.projects?.active || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {overview?.projects?.total || 0} total
                  </Typography>
                </Box>
                <ProjectIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
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
                    {formatNumber(overview?.maintenance?.overdue || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Maintenance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {overview?.maintenance?.total || 0} total
                  </Typography>
                </Box>
                <MaintenanceIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
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
                    {formatNumber(overview?.tasks?.overdue || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {overview?.tasks?.total || 0} total
                  </Typography>
                </Box>
                <TaskIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Project Status Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Project Status Distribution
              </Typography>
              {projectStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {projectStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Department Workload */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Department Workload
              </Typography>
              {departmentWorkload.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentWorkload}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activeProjects" fill="#B85494" name="Active Projects" />
                    <Bar dataKey="totalProjects" fill="#E8B4D6" name="Total Projects" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.slice(0, 6).map((activity, index) => (
                  <ListItem key={index} divider={index < 5}>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={activity.status}
                            size="small"
                            color={getActivityColor(activity.type)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            by {activity.createdBy}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                System Alerts
              </Typography>
              <List>
                {/* Low Stock Alerts */}
                {alerts.lowStock?.slice(0, 3).map((alert, index) => (
                  <ListItem key={`low-stock-${index}`} divider>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Low Stock Alert"
                      secondary={alert.message}
                    />
                  </ListItem>
                ))}

                {/* Overdue Maintenance */}
                {alerts.overdueMaintenance?.slice(0, 2).map((alert, index) => (
                  <ListItem key={`maintenance-${index}`} divider>
                    <ListItemIcon>
                      <ScheduleIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Overdue Maintenance"
                      secondary={alert.message}
                    />
                  </ListItem>
                ))}

                {/* Upcoming Maintenance */}
                {alerts.upcomingMaintenance?.slice(0, 2).map((alert, index) => (
                  <ListItem key={`upcoming-${index}`}>
                    <ListItemIcon>
                      <CheckCircleIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Upcoming Maintenance"
                      secondary={alert.message}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Developer Contact Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  component="img"
                  src="https://media.licdn.com/dms/image/v2/C510BAQE9vzMx9LndWw/company-logo_200_200/company-logo_200_200/0/1631351224335?e=2147483647&v=beta&t=gWxyPJA3rLsVaRBS9EuGzsWZOH1Wfi46yJZPqP7ng2g"
                  alt="Rishabh Instruments Logo"
                  sx={{
                    height: 32,
                    width: 32,
                    borderRadius: 1,
                    mr: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    p: 0.5
                  }}
                />
                <Typography variant="h6" fontWeight={600}>
                  System Developer
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Need customization or similar system development?
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Samarth Kasar
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption">📞</Typography>
                  <Typography variant="body2" component="a" 
                    href="tel:+919699636055" 
                    sx={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    +91 9699636055
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption">✉️</Typography>
                  <Typography variant="body2" component="a" 
                    href="mailto:samarthkasar9924@gmail.com" 
                    sx={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    samarthkasar9924@gmail.com
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  mt: 2, 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                href="tel:+919699636055"
              >
                Contact Developer
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
