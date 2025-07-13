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
  PlayArrow as StartIcon,
} from '@mui/icons-material';

import apiService from '../../services/apiService';

const Maintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    machineName: '',
    machineNo: '',
    department: 'Digital Other',
    maintenanceType: 'Preventive',
    frequency: 'Monthly',
    frequencyDays: 30,
    description: '',
    scheduledDate: '',
    assignedTo: '',
    priority: 'Medium',
    notes: '',
  });

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMaintenanceRecords();
      let records = response.data.maintenanceRecords || [];
      
      // Classify status based on dates, but respect manually set statuses
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      records = records.map(record => {
        const scheduledDate = new Date(record.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        
        // Only auto-classify if status is not manually set to specific states
        if (record.status !== 'Completed' && 
            record.status !== 'Cancelled' && 
            record.status !== 'In Progress') {
          
          if (scheduledDate > today) {
            record.status = 'Scheduled';
          } else if (scheduledDate.getTime() === today.getTime()) {
            record.status = 'Scheduled';
          } else {
            record.status = 'Overdue';
          }
        }
        // If status is 'In Progress', 'Completed', or 'Cancelled', keep it as is
        
        return record;
      });
      
      setMaintenanceRecords(records);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Don't show error for users fetch as it's not critical
    }
  };

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchUsers();
  }, []);

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setFormData({
      machineName: '',
      machineNo: '',
      department: 'Digital Other',
      maintenanceType: 'Preventive',
      frequency: 'Monthly',
      frequencyDays: 30,
      description: '',
      scheduledDate: '',
      assignedTo: '',
      priority: 'Medium',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setOpenViewDialog(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      machineName: record.machineName || '',
      machineNo: record.machineNo || '',
      department: record.department || 'Digital Other',
      maintenanceType: record.maintenanceType || 'Preventive',
      frequency: record.frequency || 'Monthly',
      frequencyDays: record.frequencyDays || 30,
      description: record.description || '',
      scheduledDate: record.scheduledDate ? new Date(record.scheduledDate).toISOString().split('T')[0] : '',
      assignedTo: record.assignedTo?._id || record.assignedTo || '',
      priority: record.priority || 'Medium',
      notes: record.notes || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenViewDialog(false);
    setSelectedRecord(null);
    setError(''); // Clear errors when closing dialog
    setSuccess(''); // Clear success messages when closing dialog
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.machineName) {
        setError('Machine name is required');
        return;
      }
      
      if (!formData.machineNo) {
        setError('Machine number is required');
        return;
      }
      
      if (!formData.description) {
        setError('Description is required');
        return;
      }
      
      if (!formData.scheduledDate) {
        setError('Scheduled date is required');
        return;
      }

      if (!formData.assignedTo) {
        setError('Please assign this maintenance task to someone');
        return;
      }

      // Transform form data to match backend schema
      const transformedData = {
        machineName: formData.machineName,
        machineNo: formData.machineNo,
        department: formData.department,
        maintenanceType: formData.maintenanceType,
        frequency: formData.frequency,
        frequencyDays: parseInt(formData.frequencyDays),
        description: formData.description,
        scheduledDate: formData.scheduledDate,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        notes: formData.notes,
      };

      console.log('Sending maintenance data:', transformedData);

      if (selectedRecord) {
        await apiService.updateMaintenanceRecord(selectedRecord._id, transformedData);
      } else {
        await apiService.createMaintenanceRecord(transformedData);
      }
      await fetchMaintenanceRecords();
      handleCloseDialog();
      setError(''); // Clear any previous errors
      setSuccess('Maintenance task saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      setError('Failed to save maintenance record: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await apiService.updateMaintenanceStatus(id, { 
        status: 'Completed',
        notes: 'Task completed successfully'
      });
      await fetchMaintenanceRecords();
      setSuccess('Task completed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStartTask = async (id) => {
    try {
      await apiService.updateMaintenanceStatus(id, { 
        status: 'In Progress',
        notes: 'Task started'
      });
      await fetchMaintenanceRecords();
      setSuccess('Task started successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error starting task:', error);
      setError('Failed to start task: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'info',
      'In Progress': 'warning',
      'Completed': 'success',
      'Overdue': 'error',
      'Cancelled': 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'success',
      'Medium': 'info',
      'High': 'warning',
      'Critical': 'error',
    };
    return colors[priority] || 'default';
  };

  const getTypeIcon = (type) => {
    return type === 'Preventive' ? <ScheduleIcon /> : <MaintenanceIcon />;
  };

  const filterRecordsByTab = () => {
    switch (activeTab) {
      case 0: // All
        return maintenanceRecords;
      case 1: // Scheduled
        return maintenanceRecords.filter(r => r.status === 'Scheduled');
      case 2: // In Progress
        return maintenanceRecords.filter(r => r.status === 'In Progress');
      case 3: // Completed
        return maintenanceRecords.filter(r => r.status === 'Completed');
      case 4: // Overdue
        return maintenanceRecords.filter(r => r.status === 'Overdue');
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

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
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
                {maintenanceRecords.filter(r => r.status === 'In Progress').length}
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
                {maintenanceRecords.filter(r => r.status === 'Overdue').length}
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
                {maintenanceRecords.filter(r => r.status === 'Completed').length}
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
                          {record.machineName}
                        </Typography>
                        {record.machineNo && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            ID: {record.machineNo}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getTypeIcon(record.maintenanceType)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {record.maintenanceType}
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
                        {record.frequency && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {record.frequency}
                          </Typography>
                        )}
                        {/* Show visual indicator for overdue tasks */}
                        {record.status === 'Overdue' && (
                          <Typography variant="caption" color="error" display="block">
                            <WarningIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Overdue
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.assignedTo?.name || 'Not assigned'}
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
                        <IconButton size="small" onClick={() => handleViewRecord(record)} title="View Details">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEditRecord(record)} title="Edit Task">
                          <EditIcon />
                        </IconButton>
                        {record.status === 'Scheduled' && (
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleStartTask(record._id)}
                            title="Start Task"
                          >
                            <StartIcon />
                          </IconButton>
                        )}
                        {(record.status === 'In Progress' || record.status === 'Scheduled') && (
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleCompleteTask(record._id)}
                            title="Complete Task"
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Machine Name"
                value={formData.machineName}
                onChange={(e) => setFormData(prev => ({ ...prev, machineName: e.target.value }))}
                required
                error={!formData.machineName}
                helperText={!formData.machineName ? 'Machine name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Machine Number/ID"
                value={formData.machineNo}
                onChange={(e) => setFormData(prev => ({ ...prev, machineNo: e.target.value }))}
                required
                error={!formData.machineNo}
                helperText={!formData.machineNo ? 'Machine number is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                required
              >
                <MenuItem value="CAM Switch">CAM Switch</MenuItem>
                <MenuItem value="Transducer">Transducer</MenuItem>
                <MenuItem value="MID">MID</MenuItem>
                <MenuItem value="MFM">MFM</MenuItem>
                <MenuItem value="PQ">PQ</MenuItem>
                <MenuItem value="EQ">EQ</MenuItem>
                <MenuItem value="MDI">MDI</MenuItem>
                <MenuItem value="CT">CT</MenuItem>
                <MenuItem value="SMT">SMT</MenuItem>
                <MenuItem value="Digital Other">Digital Other</MenuItem>
                <MenuItem value="Discrete">Discrete</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Maintenance Type"
                value={formData.maintenanceType}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceType: e.target.value }))}
                required
              >
                <MenuItem value="Preventive">Preventive</MenuItem>
                <MenuItem value="Corrective">Corrective</MenuItem>
                <MenuItem value="Predictive">Predictive</MenuItem>
                <MenuItem value="Routine">Routine</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Frequency"
                value={formData.frequency}
                onChange={(e) => {
                  const frequency = e.target.value;
                  let days = 30;
                  switch (frequency) {
                    case 'Daily': days = 1; break;
                    case 'Weekly': days = 7; break;
                    case 'Monthly': days = 30; break;
                    case 'Quarterly': days = 90; break;
                    case 'Semi-Annual': days = 180; break;
                    case 'Annual': days = 365; break;
                  }
                  setFormData(prev => ({ ...prev, frequency, frequencyDays: days }));
                }}
                required
              >
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Quarterly">Quarterly</MenuItem>
                <MenuItem value="Semi-Annual">Semi-Annual</MenuItem>
                <MenuItem value="Annual">Annual</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                required
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
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
                error={!formData.description}
                helperText={!formData.description ? 'Description is required' : ''}
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
                error={!formData.scheduledDate}
                helperText={!formData.scheduledDate ? 'Scheduled date is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                required
                error={!formData.assignedTo}
                helperText={!formData.assignedTo ? 'Please assign this task to someone' : ''}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.department || 'No department'})
                  </MenuItem>
                ))}
              </TextField>
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

      {/* View Maintenance Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Maintenance Task Details</Typography>
            <Chip 
              label={selectedRecord?.status || 'Unknown'} 
              color={getStatusColor(selectedRecord?.status)} 
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Machine Name</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedRecord.machineName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Machine Number</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedRecord.machineNo}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedRecord.department}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Maintenance Type</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedRecord.maintenanceType}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Frequency</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedRecord.frequency}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                <Chip 
                  label={selectedRecord.priority} 
                  color={getPriorityColor(selectedRecord.priority)} 
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{selectedRecord.description}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Scheduled Date</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(selectedRecord.scheduledDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedRecord.assignedTo?.name || 'Not assigned'}
                </Typography>
              </Grid>
              {selectedRecord.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                  <Typography variant="body1">{selectedRecord.notes}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                <Typography variant="body1">
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button 
            variant="outlined" 
            onClick={() => {
              setOpenViewDialog(false);
              handleEditRecord(selectedRecord);
            }}
          >
            Edit Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maintenance;
