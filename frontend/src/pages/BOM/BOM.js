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
  CheckCircle as ApproveIcon,
  Launch as ReleaseIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  Info as InfoIcon,
  CheckCircleOutline as SuccessIcon,
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
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '',
    bomId: '',
    bomName: '',
    title: '',
    content: '',
    action: null
  });
  const [successDialog, setSuccessDialog] = useState({
    open: false,
    title: '',
    content: '',
    details: []
  });
  const [bomFormData, setBomFormData] = useState({
    project: '',
    version: '1.0',
    status: 'Draft',
    materials: [],
    notes: '',
    estimatedCompletionTime: '',
    priority: 'Medium',
    revisionReason: '',
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
      project: '',
      version: '1.0',
      status: 'Draft',
      materials: [],
      notes: '',
      estimatedCompletionTime: '',
      priority: 'Medium',
      revisionReason: '',
    });
    setOpenDialog(true);
  };

  const handleEditBom = (bom) => {
    setSelectedBom(bom);
    setBomFormData({
      project: bom.project?._id || '',
      version: bom.version || '1.0',
      status: bom.status || 'Draft',
      materials: bom.materials?.map(m => ({
        material: m.material?._id || '',
        quantity: m.quantity || 1,
        unit: m.unit || '',
        unitCost: m.unitCost || 0,
        supplier: m.supplier || '',
        leadTime: m.leadTime || 0,
        notes: m.notes || '',
        isAlternative: m.isAlternative || false,
        parentMaterial: m.parentMaterial || ''
      })) || [],
      notes: bom.notes || '',
      estimatedCompletionTime: bom.estimatedCompletionTime || '',
      priority: bom.priority || 'Medium',
      revisionReason: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBom(null);
    setBomFormData({
      project: '',
      version: '1.0',
      status: 'Draft',
      materials: [],
      notes: '',
      estimatedCompletionTime: '',
      priority: 'Medium',
      revisionReason: '',
    });
  };

  const handleAddMaterial = () => {
    setBomFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { 
        material: '', 
        quantity: 1, 
        unit: '',
        unitCost: 0,
        supplier: '',
        leadTime: 0,
        notes: '',
        isAlternative: false,
        parentMaterial: ''
      }]
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
      // Validation
      if (!bomFormData.project) {
        setError('Please select a project');
        return;
      }
      
      if (bomFormData.materials.length === 0) {
        setError('Please add at least one material');
        return;
      }

      // Validate materials
      for (let i = 0; i < bomFormData.materials.length; i++) {
        const material = bomFormData.materials[i];
        if (!material.material) {
          setError(`Please select material for item ${i + 1}`);
          return;
        }
        if (material.quantity <= 0) {
          setError(`Please enter valid quantity for item ${i + 1}`);
          return;
        }
      }

      // Calculate total costs for each material
      const processedMaterials = bomFormData.materials.map(bomMat => {
        const materialData = materials.find(m => m._id === bomMat.material);
        const unitCost = bomMat.unitCost || materialData?.unitPrice || 0;
        const totalCost = bomMat.quantity * unitCost;
        
        return {
          material: bomMat.material,
          quantity: bomMat.quantity,
          unit: bomMat.unit || materialData?.unit || 'pcs',
          unitCost: unitCost,
          totalCost: totalCost,
          supplier: bomMat.supplier || materialData?.supplier?.name || 'Default Supplier',
          leadTime: bomMat.leadTime || 0,
          notes: bomMat.notes || '',
          isAlternative: bomMat.isAlternative || false,
          parentMaterial: bomMat.parentMaterial || null
        };
      });

      const submitData = {
        ...bomFormData,
        materials: processedMaterials
      };

      if (selectedBom) {
        await apiService.updateBOM(selectedBom._id, submitData);
        setError('');
      } else {
        await apiService.createBOM(submitData);
        setError('');
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving BOM:', error);
      setError(error.response?.data?.message || 'Failed to save BOM');
    }
  };

  const handleApproveBom = async (bomId) => {
    try {
      await apiService.approveBOM(bomId);
      setError('');
      await fetchData();
    } catch (error) {
      console.error('Error approving BOM:', error);
      setError(error.response?.data?.message || 'Failed to approve BOM');
    }
  };

  const handleReleaseBom = async (bomId) => {
    const bom = boms.find(b => b._id === bomId);
    setConfirmDialog({
      open: true,
      type: 'release',
      bomId: bomId,
      bomName: bom?.bomId || `BOM-${bomId?.slice(-6)}`,
      title: 'Release BOM',
      content: `Are you sure you want to release "${bom?.bomId || `BOM-${bomId?.slice(-6)}`}"? This will deduct materials from inventory and cannot be undone.`,
      action: async () => {
        try {
          console.log('Releasing BOM with ID:', bomId);
          const result = await apiService.releaseBOM(bomId);
          setError('');
          
          // Show success message with deducted materials
          if (result.data.deductedMaterials) {
            const deductedList = result.data.deductedMaterials.map(m => 
              `${m.material}: ${m.deductedQuantity} ${m.unit}`
            );
            setSuccessDialog({
              open: true,
              title: 'BOM Released Successfully!',
              content: `BOM "${bom?.bomId || `BOM-${bomId?.slice(-6)}`}" has been released and materials have been deducted from inventory.`,
              details: deductedList
            });
          } else {
            setSuccessDialog({
              open: true,
              title: 'BOM Released Successfully!',
              content: `BOM "${bom?.bomId || `BOM-${bomId?.slice(-6)}`}" has been released.`,
              details: []
            });
          }
          
          // Refresh all data including materials to show updated quantities
          await fetchData();
        } catch (error) {
          console.error('Error releasing BOM:', error);
          console.error('Full error:', error.response?.data);
          setError(error.response?.data?.message || 'Failed to release BOM');
        }
      }
    });
  };

  const handleObsoleteBom = async (bomId) => {
    const bom = boms.find(b => b._id === bomId);
    setConfirmDialog({
      open: true,
      type: 'obsolete',
      bomId: bomId,
      bomName: bom?.bomId || `BOM-${bomId?.slice(-6)}`,
      title: 'Mark BOM as Obsolete',
      content: `Are you sure you want to mark "${bom?.bomId || `BOM-${bomId?.slice(-6)}`}" as obsolete? This action will make it inactive and it cannot be released.`,
      action: async () => {
        try {
          await apiService.obsoleteBOM(bomId);
          setError('');
          await fetchData();
        } catch (error) {
          console.error('Error marking BOM as obsolete:', error);
          setError(error.response?.data?.message || 'Failed to mark BOM as obsolete');
        }
      }
    });
  };

  const handleDeleteBom = async (bomId) => {
    const bom = boms.find(b => b._id === bomId);
    setConfirmDialog({
      open: true,
      type: 'delete',
      bomId: bomId,
      bomName: bom?.bomId || `BOM-${bomId?.slice(-6)}`,
      title: 'Delete BOM',
      content: `Are you sure you want to delete "${bom?.bomId || `BOM-${bomId?.slice(-6)}`}"? This action cannot be undone and all associated data will be permanently removed.`,
      action: async () => {
        try {
          await apiService.deleteBOM(bomId);
          setError('');
          await fetchData();
        } catch (error) {
          console.error('Error deleting BOM:', error);
          setError(error.response?.data?.message || 'Failed to delete BOM');
        }
      }
    });
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action();
    }
    setConfirmDialog({ open: false, type: '', bomId: '', bomName: '', title: '', content: '', action: null });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, type: '', bomId: '', bomName: '', title: '', content: '', action: null });
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialog({ open: false, title: '', content: '', details: [] });
  };

  const calculateTotalCost = (bom) => {
    return bom.materials?.reduce((total, bomMaterial) => {
      const material = materials.find(m => m._id === bomMaterial.material?._id);
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
                {new Set(boms.map(bom => bom.project?._id).filter(Boolean)).size}
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
                        {bom.bomId || `BOM-${bom._id?.slice(-6)}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Project: {bom.project?.projectName || bom.project?.name || 'No Project'} • 
                        Materials: {bom.materials?.length || 0} • 
                        Cost: ₹{calculateTotalCost(bom).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={bom.status}
                        color={
                          bom.status === 'Draft' ? 'default' :
                          bom.status === 'Approved' ? 'primary' :
                          bom.status === 'Released' ? 'success' :
                          'error'
                        }
                        size="small"
                        sx={{ minWidth: '80px' }}
                      />
                      {bom.status === 'Draft' && (
                        <Chip 
                          label="Approve" 
                          variant="outlined" 
                          size="small" 
                          icon={<ApproveIcon />}
                          onClick={(e) => { e.stopPropagation(); handleApproveBom(bom._id); }}
                          sx={{ '&:hover': { backgroundColor: 'success.light', color: 'white' } }}
                        />
                      )}
                      {bom.status === 'Approved' && (
                        <Chip 
                          label="Release" 
                          variant="outlined" 
                          size="small" 
                          icon={<ReleaseIcon />}
                          onClick={(e) => { e.stopPropagation(); handleReleaseBom(bom._id); }}
                          sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
                        />
                      )}
                      {(bom.status === 'Released') && (
                        <Chip 
                          label="Obsolete" 
                          variant="outlined" 
                          size="small" 
                          color="error"
                          onClick={(e) => { e.stopPropagation(); handleObsoleteBom(bom._id); }}
                          sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                        />
                      )}
                      {(bom.status === 'Draft' || bom.status === 'Obsolete') && (
                        <Chip 
                          label="Delete" 
                          variant="outlined" 
                          size="small" 
                          color="error"
                          icon={<DeleteIcon />}
                          onClick={(e) => { e.stopPropagation(); handleDeleteBom(bom._id); }}
                          sx={{ '&:hover': { backgroundColor: 'error.main', color: 'white' } }}
                        />
                      )}
                      <Chip 
                        label="Edit" 
                        variant="outlined" 
                        size="small" 
                        icon={<EditIcon />}
                        onClick={(e) => { e.stopPropagation(); handleEditBom(bom); }}
                        sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                      />
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
                              const material = materials.find(m => m._id === bomMaterial.material?._id);
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
                            primary="Status" 
                            secondary={bom.status}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Version" 
                            secondary={bom.version || '1.0'}
                          />
                        </ListItem>
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
                        {bom.approvedBy && (
                          <ListItem>
                            <ListItemText 
                              primary="Approved By" 
                              secondary={bom.approvedBy.name || 'Unknown'}
                            />
                          </ListItem>
                        )}
                        {bom.notes && (
                          <ListItem>
                            <ListItemText 
                              primary="Notes" 
                              secondary={bom.notes}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xl" fullWidth>
        <DialogTitle>
          {selectedBom ? 'Edit BOM' : 'Create New BOM'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project *"
                select
                value={bomFormData.project}
                onChange={(e) => setBomFormData(prev => ({ ...prev, project: e.target.value }))}
                required
                error={!bomFormData.project}
                helperText={!bomFormData.project ? 'Project is required' : 'Select the project this BOM belongs to'}
              >
                <MenuItem value="">Select Project</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.projectName || project.name} ({project.projectId})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Version"
                value={bomFormData.version}
                onChange={(e) => setBomFormData(prev => ({ ...prev, version: e.target.value }))}
                helperText="e.g., 1.0, 2.1"
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Status"
                select
                value={bomFormData.status}
                onChange={(e) => setBomFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Released">Released</MenuItem>
                <MenuItem value="Obsolete">Obsolete</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Priority"
                select
                value={bomFormData.priority}
                onChange={(e) => setBomFormData(prev => ({ ...prev, priority: e.target.value }))}
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
                label="Estimated Completion Time"
                value={bomFormData.estimatedCompletionTime}
                onChange={(e) => setBomFormData(prev => ({ ...prev, estimatedCompletionTime: e.target.value }))}
                helperText="e.g., 2 weeks, 30 days"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              {selectedBom && (
                <TextField
                  fullWidth
                  label="Revision Reason"
                  value={bomFormData.revisionReason}
                  onChange={(e) => setBomFormData(prev => ({ ...prev, revisionReason: e.target.value }))}
                  helperText="Why is this BOM being revised?"
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={bomFormData.notes}
                onChange={(e) => setBomFormData(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
                helperText="General notes, assembly instructions, or special requirements"
              />
            </Grid>
            
            {/* Materials Section */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2}>
                <Typography variant="h6" color="primary">
                  Materials List
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddMaterial}
                  size="small"
                >
                  Add Material
                </Button>
              </Box>
              
              {bomFormData.materials.length === 0 ? (
                <Box textAlign="center" py={4} border="2px dashed #e0e0e0" borderRadius={1}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No materials added yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddMaterial}
                    size="small"
                  >
                    Add First Material
                  </Button>
                </Box>
              ) : (
                bomFormData.materials.map((material, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Material *"
                          select
                          value={material.material}
                          onChange={(e) => {
                            handleMaterialChange(index, 'material', e.target.value);
                            // Auto-fill unit and cost from selected material
                            const selectedMat = materials.find(m => m._id === e.target.value);
                            if (selectedMat) {
                              handleMaterialChange(index, 'unit', selectedMat.unit);
                              handleMaterialChange(index, 'unitCost', selectedMat.unitPrice);
                              handleMaterialChange(index, 'supplier', selectedMat.supplier?.name || '');
                            }
                          }}
                          size="small"
                          error={!material.material}
                        >
                          <MenuItem value="">Select Material</MenuItem>
                          {materials.map((mat) => (
                            <MenuItem key={mat._id} value={mat._id}>
                              {mat.name} ({mat.serialNumber}) - Available: {mat.quantityAvailable} {mat.unit}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} sm={1.5}>
                        <TextField
                          fullWidth
                          label="Qty *"
                          type="number"
                          value={material.quantity}
                          onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                          error={material.quantity <= 0}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={1}>
                        <TextField
                          fullWidth
                          label="Unit"
                          value={material.unit}
                          onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={1.5}>
                        <TextField
                          fullWidth
                          label="Unit Cost (₹)"
                          type="number"
                          value={material.unitCost}
                          onChange={(e) => handleMaterialChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={1.5}>
                        <TextField
                          fullWidth
                          label="Supplier"
                          value={material.supplier}
                          onChange={(e) => handleMaterialChange(index, 'supplier', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={1}>
                        <TextField
                          fullWidth
                          label="Lead Time (days)"
                          type="number"
                          value={material.leadTime}
                          onChange={(e) => handleMaterialChange(index, 'leadTime', parseInt(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={1.5}>
                        <TextField
                          fullWidth
                          label="Notes"
                          value={material.notes}
                          onChange={(e) => handleMaterialChange(index, 'notes', e.target.value)}
                          size="small"
                          placeholder="Optional notes"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={0.5}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveMaterial(index)}
                          size="small"
                          title="Remove material"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Grid>

                      {/* Cost Summary for this material */}
                      <Grid item xs={12}>
                        <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Total Cost: ₹{((material.quantity || 0) * (material.unitCost || 0)).toFixed(2)} | 
                            Available Stock: {materials.find(m => m._id === material.material)?.quantityAvailable || 0} {material.unit}
                            {materials.find(m => m._id === material.material)?.quantityAvailable < material.quantity && (
                              <Chip label="Insufficient Stock" color="error" size="small" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                ))
              )}

              {/* Total Cost Summary */}
              {bomFormData.materials.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    Total BOM Cost: ₹{bomFormData.materials.reduce((total, mat) => 
                      total + ((mat.quantity || 0) * (mat.unitCost || 0)), 0
                    ).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Materials: {bomFormData.materials.length} items
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!bomFormData.project || bomFormData.materials.length === 0}
          >
            {selectedBom ? 'Update' : 'Create'} BOM
          </Button>
        </DialogActions>
      </Dialog>

      {/* Styled Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pb: 1,
            color: confirmDialog.type === 'delete' ? 'error.main' : 
                   confirmDialog.type === 'obsolete' ? 'warning.main' : 'primary.main'
          }}
        >
          {confirmDialog.type === 'delete' && <ErrorIcon />}
          {confirmDialog.type === 'obsolete' && <WarningIcon />}
          {confirmDialog.type === 'release' && <ReleaseIcon />}
          <Typography variant="h6" component="span">
            {confirmDialog.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 1,
              backgroundColor: confirmDialog.type === 'delete' ? 'error.50' : 
                              confirmDialog.type === 'obsolete' ? 'warning.50' : 'primary.50',
              border: 1,
              borderColor: confirmDialog.type === 'delete' ? 'error.200' : 
                          confirmDialog.type === 'obsolete' ? 'warning.200' : 'primary.200',
              mb: 2
            }}
          >
            <Typography variant="body1" gutterBottom>
              {confirmDialog.content}
            </Typography>
            
            {confirmDialog.type === 'release' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1, border: 1, borderColor: 'info.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon color="info" fontSize="small" />
                  <Typography variant="subtitle2" color="info.main">
                    What happens when you release this BOM:
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  • Materials will be deducted from inventory
                  • BOM status will change to "Released"
                  • Material availability will be updated
                  • This action cannot be undone
                </Typography>
              </Box>
            )}
            
            {confirmDialog.type === 'obsolete' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1, border: 1, borderColor: 'warning.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon color="warning" fontSize="small" />
                  <Typography variant="subtitle2" color="warning.main">
                    Effects of marking as obsolete:
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  • BOM will be marked as inactive
                  • Cannot be released or approved
                  • Will be hidden from active BOMs list
                  • Can still be viewed for reference
                </Typography>
              </Box>
            )}
            
            {confirmDialog.type === 'delete' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'error.50', borderRadius: 1, border: 1, borderColor: 'error.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ErrorIcon color="error" fontSize="small" />
                  <Typography variant="subtitle2" color="error.main">
                    Warning: This action is permanent!
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  • All BOM data will be permanently deleted
                  • Material lists and configurations will be lost
                  • This cannot be undone
                  • Consider marking as obsolete instead
                </Typography>
              </Box>
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            BOM ID: {confirmDialog.bomName}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseConfirmDialog}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            size="large"
            color={confirmDialog.type === 'delete' ? 'error' : 
                   confirmDialog.type === 'obsolete' ? 'warning' : 'primary'}
            startIcon={
              confirmDialog.type === 'delete' ? <ErrorIcon /> :
              confirmDialog.type === 'obsolete' ? <WarningIcon /> : <ReleaseIcon />
            }
            sx={{
              minWidth: 140,
              fontWeight: 600
            }}
          >
            {confirmDialog.type === 'delete' ? 'Delete BOM' : 
             confirmDialog.type === 'obsolete' ? 'Mark Obsolete' : 'Release BOM'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialog.open}
        onClose={handleCloseSuccessDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pb: 1,
            color: 'success.main'
          }}
        >
          <SuccessIcon color="success" />
          <Typography variant="h6" component="span">
            {successDialog.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 1,
              backgroundColor: 'success.50',
              border: 1,
              borderColor: 'success.200',
              mb: 2
            }}
          >
            <Typography variant="body1" gutterBottom>
              {successDialog.content}
            </Typography>
            
            {successDialog.details.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1, border: 1, borderColor: 'info.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon color="info" fontSize="small" />
                  <Typography variant="subtitle2" color="info.main">
                    Materials Deducted from Inventory:
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  {successDialog.details.map((detail, index) => (
                    <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      • {detail}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseSuccessDialog}
            variant="contained"
            color="success"
            size="large"
            startIcon={<SuccessIcon />}
            sx={{
              minWidth: 120,
              fontWeight: 600
            }}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BOM;
