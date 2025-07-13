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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Engineering as EngineeringIcon,
  RemoveCircle as RemoveIcon,
} from '@mui/icons-material';

import apiService from '../../services/apiService';

const BOM = () => {
  const [boms, setBoms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBom, setSelectedBom] = useState(null);
  const [bomFormData, setBomFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    materials: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bomsResponse, materialsResponse, projectsResponse] = await Promise.all([
        apiService.getBOMs(),
        apiService.getMaterials(),
        apiService.getProjects(),
      ]);
      
      setBoms(bomsResponse.data.boms || []);
      setMaterials(materialsResponse.data.materials || []);
      setProjects(projectsResponse.data.projects || []);
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

  const handleAddBom = () => {
    setSelectedBom(null);
    setBomFormData({
      name: '',
      description: '',
      projectId: '',
      materials: [],
    });
    setOpenDialog(true);
  };

  const handleEditBom = (bom) => {
    setSelectedBom(bom);
    setBomFormData({
      name: bom.name,
      description: bom.description || '',
      projectId: bom.projectId?._id || '',
      materials: bom.materials || [],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBom(null);
    setBomFormData({
      name: '',
      description: '',
      projectId: '',
      materials: [],
    });
  };

  const handleAddMaterial = () => {
    setBomFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { materialId: '', quantity: 1, notes: '' }]
    }));
  };

  const handleRemoveMaterial = (index) => {
    setBomFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    setBomFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedBom) {
        await apiService.updateBOM(selectedBom._id, bomFormData);
      } else {
        await apiService.createBOM(bomFormData);
      }
      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving BOM:', error);
      setError('Failed to save BOM');
    }
  };

  const calculateTotalCost = (bom) => {
    return bom.materials?.reduce((total, bomMaterial) => {
      const material = materials.find(m => m._id === bomMaterial.materialId?._id);
      return total + (material?.unitPrice || 0) * bomMaterial.quantity;
    }, 0) || 0;
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
            Bill of Materials (BOM)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage project material lists and cost estimation
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBom}
          size="large"
        >
          Create BOM
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
                {boms.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total BOMs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {boms.reduce((total, bom) => total + (bom.materials?.length || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Materials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {boms.reduce((total, bom) => total + calculateTotalCost(bom), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Estimated Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {new Set(boms.map(bom => bom.projectId?._id).filter(Boolean)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* BOMs List */}
      <Card>
        <CardContent>
          {boms.length === 0 ? (
            <Box textAlign="center" py={6}>
              <EngineeringIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No BOMs created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first Bill of Materials to start managing project requirements
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddBom}>
                Create First BOM
              </Button>
            </Box>
          ) : (
            boms.map((bom) => (
              <Accordion key={bom._id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {bom.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Project: {bom.projectId?.name || 'No Project'} • 
                        Materials: {bom.materials?.length || 0} • 
                        Cost: ₹{calculateTotalCost(bom).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditBom(bom); }}>
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Materials List
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Material</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Unit Price</TableCell>
                              <TableCell>Total Cost</TableCell>
                              <TableCell>Notes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bom.materials?.map((bomMaterial, index) => {
                              const material = materials.find(m => m._id === bomMaterial.materialId?._id);
                              return (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                      {material?.name || 'Unknown Material'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {material?.serialNumber}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {bomMaterial.quantity} {material?.unit}
                                  </TableCell>
                                  <TableCell>
                                    ₹{(material?.unitPrice || 0).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    ₹{((material?.unitPrice || 0) * bomMaterial.quantity).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    {bomMaterial.notes || '-'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        BOM Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Total Materials" 
                            secondary={bom.materials?.length || 0}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Estimated Cost" 
                            secondary={`₹${calculateTotalCost(bom).toLocaleString()}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Created Date" 
                            secondary={new Date(bom.createdAt).toLocaleDateString()}
                          />
                        </ListItem>
                        {bom.description && (
                          <ListItem>
                            <ListItemText 
                              primary="Description" 
                              secondary={bom.description}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Edit BOM Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedBom ? 'Edit BOM' : 'Create New BOM'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="BOM Name"
                value={bomFormData.name}
                onChange={(e) => setBomFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project"
                select
                value={bomFormData.projectId}
                onChange={(e) => setBomFormData(prev => ({ ...prev, projectId: e.target.value }))}
              >
                <MenuItem value="">No Project</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={bomFormData.description}
                onChange={(e) => setBomFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
            
            {/* Materials Section */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Materials</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddMaterial}
                  size="small"
                >
                  Add Material
                </Button>
              </Box>
              
              {bomFormData.materials.map((material, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Material"
                        select
                        value={material.materialId}
                        onChange={(e) => handleMaterialChange(index, 'materialId', e.target.value)}
                        size="small"
                      >
                        {materials.map((mat) => (
                          <MenuItem key={mat._id} value={mat._id}>
                            {mat.name} ({mat.serialNumber})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={material.quantity}
                        onChange={(e) => handleMaterialChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Notes"
                        value={material.notes}
                        onChange={(e) => handleMaterialChange(index, 'notes', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveMaterial(index)}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedBom ? 'Update' : 'Create'} BOM
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BOM;
