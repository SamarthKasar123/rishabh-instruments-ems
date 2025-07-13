import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  AvatarGroup,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
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
    department: 'Digital Other',
    projectType: 'Development',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'Planning',
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
      department: 'Digital Other',
      projectType: 'Development',
      startDate: '',
      endDate: '',
      priority: 'Medium',
      status: 'Planning',
      budget: '',
      teamMembers: [],
      milestones: [],
    });
    setOpenDialog(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectFormData({
      name: project.projectName || project.name || '',
      description: project.description || '',
      clientName: project.clientName || '',
      department: project.department || 'Digital Other',
      projectType: project.projectType || 'Development',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.expectedEndDate ? new Date(project.expectedEndDate).toISOString().split('T')[0] : '',
      priority: project.priority || 'Medium',
      status: project.status || 'Planning',
      budget: project.budget?.allocated?.toString() || '',
      projectManager: project.projectManager?._id || '',
      teamMembers: project.teamMembers || [],
      milestones: project.milestones || [],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
    setError(''); // Clear errors when closing dialog
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!projectFormData.name) {
        setError('Project name is required');
        return;
      }
      
      if (!projectFormData.startDate) {
        setError('Start date is required');
        return;
      }
      
      if (!projectFormData.endDate) {
        setError('End date is required');
        return;
      }

      // Transform form data to match backend schema
      const transformedData = {
        projectName: projectFormData.name,
        description: projectFormData.description,
        department: projectFormData.department || 'Digital Other',
        projectType: projectFormData.projectType || 'Development',
        startDate: projectFormData.startDate,
        expectedEndDate: projectFormData.endDate,
        priority: projectFormData.priority,
        status: projectFormData.status,
        budget: {
          allocated: parseFloat(projectFormData.budget) || 0,
          spent: 0
        },
        clientName: projectFormData.clientName,
        // projectManager will be set by backend to current user if not provided
      };

      console.log('Sending project data:', transformedData);

      if (selectedProject) {
        await apiService.updateProject(selectedProject._id, transformedData);
      } else {
        await apiService.createProject(transformedData);
      }
      await fetchProjects();
      handleCloseDialog();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'info',
      'In Progress': 'primary',
      'On Hold': 'warning',
      'Completed': 'success',
      'Cancelled': 'error',
      'Under Maintenance': 'warning',
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

  const calculateProgress = (project) => {
    // If project has milestones, calculate based on completed milestones
    if (project.milestones && project.milestones.length > 0) {
      const completed = project.milestones.filter(m => m.status === 'completed').length;
      return (completed / project.milestones.length) * 100;
    }
    
    // Fallback: calculate progress based on project status
    const statusProgress = {
      'Planning': 10,
      'In Progress': 50,
      'Review': 80,
      'Completed': 100,
      'On Hold': 25,
      'Cancelled': 0
    };
    
    return statusProgress[project.status] || 0;
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
          Create Project
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
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
                {projects.filter(p => p.status === 'Completed').length}
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
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {projects.filter(p => p.status === 'On Hold').length}
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
                {projects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
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
            <Box>
              {projects.map((project) => {
                const progress = calculateProgress(project);
                const daysRemaining = getDaysRemaining(project.expectedEndDate || project.endDate);
                
                return (
                  <Card key={project._id} sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
                    <CardContent>
                      {/* Project Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={600} color="primary.main">
                            {project.projectName || project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {project.description || 'No description provided'}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton size="small" onClick={() => handleEditProject(project)}>
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Status and Progress */}
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
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
                      </Box>

                      {/* Key Information Grid */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Department</Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {project.department || 'Not specified'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Project Type</Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {project.projectType || 'Not specified'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Budget</Typography>
                            <Typography variant="body1" fontWeight={500} color="success.main">
                              {project.budget?.allocated ? `₹${project.budget.allocated.toLocaleString()}` : 'Not set'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Timeline</Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {daysRemaining !== null 
                                ? daysRemaining < 0 
                                  ? `${Math.abs(daysRemaining)} days overdue` 
                                  : `${daysRemaining} days remaining`
                                : 'No end date'
                              }
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Progress Bar */}
                      <Box mt={3}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      {/* Expandable Details */}
                      <Accordion sx={{ mt: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                        <AccordionSummary 
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ p: 0, minHeight: 'auto', '& .MuiAccordionSummary-content': { m: 0 } }}
                        >
                          <Typography variant="body2" color="primary.main" fontWeight={500}>
                            View Detailed Information
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0, pt: 2 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Project Details
                              </Typography>
                              <Box>
                                <Typography variant="body2" gutterBottom>
                                  <strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  <strong>End Date:</strong> {project.expectedEndDate ? new Date(project.expectedEndDate).toLocaleDateString() : 'Not set'}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Team Members
                              </Typography>
                              {project.teamMembers && project.teamMembers.length > 0 ? (
                                <AvatarGroup max={4}>
                                  {project.teamMembers.map((member, index) => (
                                    <Avatar key={index} sx={{ width: 32, height: 32 }}>
                                      {member.name?.charAt(0) || 'U'}
                                    </Avatar>
                                  ))}
                                </AvatarGroup>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No team members assigned
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProject ? 'Edit Project' : 'Create New Project'}
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
                label="Project Name"
                value={projectFormData.name}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                error={!projectFormData.name}
                helperText={!projectFormData.name ? 'Project name is required' : ''}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                value={projectFormData.department}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, department: e.target.value }))}
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
                label="Project Type"
                value={projectFormData.projectType}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, projectType: e.target.value }))}
                required
              >
                <MenuItem value="Automation">Automation</MenuItem>
                <MenuItem value="Testing">Testing</MenuItem>
                <MenuItem value="Development">Development</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Production">Production</MenuItem>
              </TextField>
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
                required
                error={!projectFormData.startDate}
                helperText={!projectFormData.startDate ? 'Start date is required' : ''}
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
                required
                error={!projectFormData.endDate}
                helperText={!projectFormData.endDate ? 'End date is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={projectFormData.priority}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, priority: e.target.value }))}
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
                select
                label="Status"
                value={projectFormData.status}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="Planning">Planning</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
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
