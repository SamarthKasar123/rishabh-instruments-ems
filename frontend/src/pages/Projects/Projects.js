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
  LinearProgress,
  Avatar,
  AvatarGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountCircle as PersonIcon,
  Timeline as TimelineIcon,
  Assignment as TaskIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Engineering as ProjectIcon,
} from '@mui/icons-material';

import apiService from '../../services/apiService';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    status: 'planning',
    budget: '',
    teamMembers: [],
    milestones: [],
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setProjectFormData({
      name: '',
      description: '',
      clientName: '',
      startDate: '',
      endDate: '',
      priority: 'medium',
      status: 'planning',
      budget: '',
      teamMembers: [],
      milestones: [],
    });
    setOpenDialog(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectFormData({
      name: project.name,
      description: project.description || '',
      clientName: project.clientName || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      priority: project.priority || 'medium',
      status: project.status || 'planning',
      budget: project.budget || '',
      teamMembers: project.teamMembers || [],
      milestones: project.milestones || [],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedProject) {
        await apiService.updateProject(selectedProject._id, projectFormData);
      } else {
        await apiService.createProject(projectFormData);
      }
      await fetchProjects();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'info',
      active: 'primary',
      'on-hold': 'warning',
      completed: 'success',
      cancelled: 'error',
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

  const calculateProgress = (project) => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completed = project.milestones.filter(m => m.status === 'completed').length;
    return (completed / project.milestones.length) * 100;
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
            Project Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track project progress, manage timelines, and monitor deliverables
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProject}
          size="large"
        >
          New Project
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
                {projects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {projects.filter(p => p.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {projects.filter(p => p.status === 'on-hold').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On Hold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects List */}
      <Card>
        <CardContent>
          {projects.length === 0 ? (
            <Box textAlign="center" py={6}>
              <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first project to start tracking progress and managing deliverables
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProject}>
                Create First Project
              </Button>
            </Box>
          ) : (
            projects.map((project) => {
              const progress = calculateProgress(project);
              const daysRemaining = getDaysRemaining(project.endDate);
              
              return (
                <Accordion key={project._id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight={600}>
                          {project.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Chip 
                            label={project.status} 
                            color={getStatusColor(project.status)} 
                            size="small" 
                          />
                          <Chip 
                            label={`${project.priority} priority`} 
                            color={getPriorityColor(project.priority)} 
                            size="small" 
                            variant="outlined"
                          />
                          {project.clientName && (
                            <Typography variant="body2" color="text.secondary">
                              Client: {project.clientName}
                            </Typography>
                          )}
                          {daysRemaining !== null && (
                            <Typography variant="body2" color={daysRemaining < 0 ? 'error.main' : 'text.secondary'}>
                              {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                            </Typography>
                          )}
                        </Box>
                        <Box mt={2} mb={1}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={progress} />
                        </Box>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}>
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Project Details
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {project.description || 'No description available'}
                        </Typography>
                        
                        {project.milestones && project.milestones.length > 0 && (
                          <>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom mt={3}>
                              Milestones
                            </Typography>
                            <List dense>
                              {project.milestones.map((milestone, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    {milestone.status === 'completed' ? (
                                      <CheckIcon color="success" />
                                    ) : (
                                      <ScheduleIcon color="action" />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={milestone.name}
                                    secondary={`Due: ${new Date(milestone.dueDate).toLocaleDateString()} • ${milestone.status}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Project Info
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Start Date" 
                              secondary={project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="End Date" 
                              secondary={project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Budget" 
                              secondary={project.budget ? `₹${project.budget.toLocaleString()}` : 'Not set'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Team Members" 
                              secondary={project.teamMembers?.length || 0}
                            />
                          </ListItem>
                        </List>
                        
                        {project.teamMembers && project.teamMembers.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                              Team
                            </Typography>
                            <AvatarGroup max={4}>
                              {project.teamMembers.map((member, index) => (
                                <Avatar key={index} sx={{ width: 32, height: 32 }}>
                                  {member.name?.charAt(0) || 'U'}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectFormData.name}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={projectFormData.clientName}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={projectFormData.startDate}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={projectFormData.endDate}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Priority"
                select
                value={projectFormData.priority}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Status"
                select
                value={projectFormData.status}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on-hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Budget (₹)"
                type="number"
                value={projectFormData.budget}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedProject ? 'Update' : 'Create'} Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
