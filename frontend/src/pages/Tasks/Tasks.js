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
  Avatar,
  AvatarGroup,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as TaskIcon,
  CheckCircle as CompleteIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

import apiService from '../../services/apiService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    estimatedHours: '',
    tags: '',
    taskType: 'Project Task',
    department: 'Digital Other',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse, usersResponse] = await Promise.all([
        apiService.getTasks(),
        apiService.getProjects(),
        apiService.getUsers(),
      ]);
      
      setTasks(tasksResponse.data.tasks || []);
      setProjects(projectsResponse.data.projects || []);
      setUsers(usersResponse.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTask = () => {
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: '',
      assignedTo: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '',
      estimatedHours: '',
      tags: '',
      taskType: 'Project Task',
      department: 'Digital Other',
    });
    setOpenDialog(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setOpenViewDialog(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      projectId: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task.estimatedHours || '',
      tags: task.tags?.join(', ') || '',
      taskType: task.taskType || 'Project Task',
      department: task.department || 'Digital Other',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedTask(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title) {
        setError('Task title is required');
        return;
      }
      
      if (!formData.assignedTo) {
        setError('Please assign the task to someone');
        return;
      }
      
      if (!formData.dueDate) {
        setError('Due date is required');
        return;
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        project: formData.projectId || undefined,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        estimatedHours: parseFloat(formData.estimatedHours) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        taskType: formData.taskType,
        department: formData.department,
      };

      console.log('Sending task data:', submitData);
      
      if (selectedTask) {
        await apiService.updateTask(selectedTask._id, submitData);
      } else {
        await apiService.createTask(submitData);
      }
      await fetchData();
      handleCloseDialog();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiService.updateTask(taskId, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'default',
      'In Progress': 'info',
      'Completed': 'success',
      'Cancelled': 'error',
      'On Hold': 'warning',
      'Under Review': 'warning',
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

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterTasksByTab = () => {
    switch (activeTab) {
      case 0: // All
        return tasks;
      case 1: // Pending
        return tasks.filter(t => t.status === 'Pending');
      case 2: // In Progress
        return tasks.filter(t => t.status === 'In Progress');
      case 3: // Completed
        return tasks.filter(t => t.status === 'Completed');
      case 4: // Overdue
        return tasks.filter(t => {
          const daysUntilDue = getDaysUntilDue(t.dueDate);
          return daysUntilDue < 0 && t.status !== 'Completed';
        });
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasksByTab();

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
            Task Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign, track, and monitor task progress across all projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          size="large"
        >
          Create Task
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
                {tasks.length}
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
              <Typography variant="h4" fontWeight={700} color="info.main">
                {tasks.filter(t => t.status === 'In Progress').length}
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
              <Typography variant="h4" fontWeight={700} color="success.main">
                {tasks.filter(t => t.status === 'Completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {tasks.filter(t => {
                  const daysUntilDue = getDaysUntilDue(t.dueDate);
                  return daysUntilDue < 0 && t.status !== 'Completed';
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
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
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          <Tab label="Overdue" />
        </Tabs>
      </Card>

      {/* Tasks */}
      <Card>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <Box textAlign="center" py={6}>
              <TaskIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first task to start organizing and tracking work
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddTask}>
                Create First Task
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const daysUntilDue = getDaysUntilDue(task.dueDate);
                    const isOverdue = daysUntilDue < 0 && task.status !== 'completed';
                    
                    return (
                      <TableRow key={task._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {task.description.length > 60 
                                ? `${task.description.substring(0, 60)}...` 
                                : task.description}
                            </Typography>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <Box mt={1}>
                              {task.tags.slice(0, 2).map((tag, index) => (
                                <Chip 
                                  key={index}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, fontSize: '0.7rem' }}
                                />
                              ))}
                              {task.tags.length > 2 && (
                                <Chip 
                                  label={`+${task.tags.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.project?.projectName || task.project?.name || 'No Project'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                              {task.assignedTo?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body2">
                              {task.assignedTo?.name || 'Unassigned'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.priority}
                            color={getPriorityColor(task.priority)}
                            size="small"
                            icon={<FlagIcon />}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <Box>
                              <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'}>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </Typography>
                              {daysUntilDue !== null && (
                                <Typography variant="caption" color={isOverdue ? 'error.main' : 'text.secondary'}>
                                  {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No due date
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            color={getStatusColor(task.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleViewTask(task)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEditTask(task)}>
                            <EditIcon />
                          </IconButton>
                          {task.status === 'Pending' && (
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleStatusChange(task._id, 'In Progress')}
                            >
                              <StartIcon />
                            </IconButton>
                          )}
                          {task.status === 'In Progress' && (
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleStatusChange(task._id, 'Completed')}
                            >
                              <CompleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* View Task Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Task Details
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedTask.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Task ID: {selectedTask.taskId}
                </Typography>
              </Grid>
              
              {selectedTask.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTask.description}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Task Type
                </Typography>
                <Typography variant="body2">
                  {selectedTask.taskType}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Department
                </Typography>
                <Typography variant="body2">
                  {selectedTask.department}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Project
                </Typography>
                <Typography variant="body2">
                  {selectedTask.project?.projectName || selectedTask.project?.name || 'No Project'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Assigned To
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {selectedTask.assignedTo?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">
                      {selectedTask.assignedTo?.name || 'Unassigned'}
                    </Typography>
                    {selectedTask.assignedTo?.email && (
                      <Typography variant="caption" color="text.secondary">
                        {selectedTask.assignedTo.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Priority
                </Typography>
                <Chip
                  label={selectedTask.priority}
                  color={getPriorityColor(selectedTask.priority)}
                  size="small"
                  icon={<FlagIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={selectedTask.status}
                  color={getStatusColor(selectedTask.status)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Estimated Hours
                </Typography>
                <Typography variant="body2">
                  {selectedTask.estimatedHours || 0} hours
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Due Date
                </Typography>
                <Typography variant="body2">
                  {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Created Date
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedTask.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selectedTask.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleCloseViewDialog();
              handleEditTask(selectedTask);
            }}
            startIcon={<EditIcon />}
          >
            Edit Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                error={!formData.title}
                helperText={!formData.title ? 'Task title is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Task Type"
                select
                value={formData.taskType}
                onChange={(e) => setFormData(prev => ({ ...prev, taskType: e.target.value }))}
                required
              >
                <MenuItem value="Project Task">Project Task</MenuItem>
                <MenuItem value="Maintenance Task">Maintenance Task</MenuItem>
                <MenuItem value="Quality Check">Quality Check</MenuItem>
                <MenuItem value="Documentation">Documentation</MenuItem>
                <MenuItem value="Training">Training</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                select
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
                label="Project"
                select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              >
                <MenuItem value="">No Project</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.projectName || project.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To"
                select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                required
                error={!formData.assignedTo}
                helperText={!formData.assignedTo ? 'Please assign the task to someone' : ''}
              >
                <MenuItem value="">Select User</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Priority"
                select
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Status"
                select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                required
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                error={!formData.dueDate}
                helperText={!formData.dueDate ? 'Due date is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="urgent, backend, testing"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedTask ? 'Update' : 'Create'} Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
