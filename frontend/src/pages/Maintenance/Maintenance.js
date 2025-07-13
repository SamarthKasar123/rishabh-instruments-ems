import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Build as MaintenanceIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';

import apiService from '../../services/apiService';

const Maintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    equipmentName: '',
    equipmentId: '',
    type: 'preventive',
    description: '',
    scheduledDate: '',
    assignedTo: '',
    priority: 'medium',
    estimatedHours: '',
    notes: '',
  });

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMaintenanceRecords();
      setMaintenanceRecords(response.data.maintenanceRecords || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setFormData({
      equipmentName: '',
      equipmentId: '',
      type: 'preventive',
      description: '',
      scheduledDate: '',
      assignedTo: '',
      priority: 'medium',
      estimatedHours: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      equipmentName: record.equipmentName || '',
      equipmentId: record.equipmentId || '',
      type: record.type || 'preventive',
      description: record.description || '',
      scheduledDate: record.scheduledDate ? new Date(record.scheduledDate).toISOString().split('T')[0] : '',
      assignedTo: record.assignedTo || '',
      priority: record.priority || 'medium',
      estimatedHours: record.estimatedHours || '',
      notes: record.notes || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedRecord) {
        await apiService.updateMaintenanceRecord(selectedRecord._id, formData);
      } else {
        await apiService.createMaintenanceRecord(formData);
      }
      await fetchMaintenanceRecords();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      setError('Failed to save maintenance record');
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await apiService.updateMaintenanceRecord(id, { status: 'completed' });
      await fetchMaintenanceRecords();
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'info',
      'in-progress': 'warning',
      completed: 'success',
      overdue: 'error',
      cancelled: 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      critical: 'error',
    };
    return colors[priority] || 'default';
  };

  const getTypeIcon = (type) => {
    return type === 'preventive' ? <ScheduleIcon /> : <MaintenanceIcon />;
  };

  const filterRecordsByTab = () => {
    switch (activeTab) {
      case 0: // All
        return maintenanceRecords;
      case 1: // Scheduled
        return maintenanceRecords.filter(r => r.status === 'scheduled');
      case 2: // In Progress
        return maintenanceRecords.filter(r => r.status === 'in-progress');
      case 3: // Completed
        return maintenanceRecords.filter(r => r.status === 'completed');
      case 4: // Overdue
        return maintenanceRecords.filter(r => r.status === 'overdue');
      default:
        return maintenanceRecords;
    }
  };

  const filteredRecords = filterRecordsByTab();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Maintenance Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule and track preventive maintenance and repair tasks
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRecord}
          size="large"
        >
          Schedule Maintenance
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {maintenanceRecords.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {maintenanceRecords.filter(r => r.status === 'in-progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {maintenanceRecords.filter(r => r.status === 'overdue').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {maintenanceRecords.filter(r => r.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Tasks" />
          <Tab label="Scheduled" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          <Tab label="Overdue" />
        </Tabs>
      </Card>

      {/* Maintenance Records */}
      <Card>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <Box textAlign="center" py={6}>
              <MaintenanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No maintenance tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Schedule your first maintenance task to start tracking equipment health
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRecord}>
                Schedule First Task
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Scheduled Date</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {record.equipmentName}
                        </Typography>
                        {record.equipmentId && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            ID: {record.equipmentId}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getTypeIcon(record.type)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {record.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(record.scheduledDate).toLocaleDateString()}
                        </Typography>
                        {record.estimatedHours && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Est. {record.estimatedHours}h
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.assignedTo || 'Not assigned'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.priority}
                          color={getPriorityColor(record.priority)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={getStatusColor(record.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEditRecord(record)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEditRecord(record)}>
                          <EditIcon />
                        </IconButton>
                        {record.status !== 'completed' && (
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleCompleteTask(record._id)}
                          >
                            <CompleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Maintenance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRecord ? 'Edit Maintenance Task' : 'Schedule New Maintenance'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Equipment Name"
                value={formData.equipmentName}
                onChange={(e) => setFormData(prev => ({ ...prev, equipmentName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Equipment ID"
                value={formData.equipmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, equipmentId: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maintenance Type"
                select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
              >
                <MenuItem value="preventive">Preventive</MenuItem>
                <MenuItem value="corrective">Corrective</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Priority"
                select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                required
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedRecord ? 'Update' : 'Schedule'} Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maintenance;
