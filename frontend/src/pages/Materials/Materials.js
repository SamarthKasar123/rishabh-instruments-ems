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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import apiService from '../../services/apiService';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    unit: '',
    quantityAvailable: 0,
    minStockLevel: 10,
    maxStockLevel: 100,
    unitPrice: 0,
    supplierName: '',
    supplierContact: '',
    supplierEmail: '',
    supplierAddress: '',
    warehouse: '',
    rack: '',
    bin: '',
    qualityGrade: 'A',
    expiryDate: '',
    specifications: {},
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMaterials();
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      subCategory: '',
      unit: '',
      quantityAvailable: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unitPrice: 0,
      supplierName: '',
      supplierContact: '',
      supplierEmail: '',
      supplierAddress: '',
      warehouse: '',
      rack: '',
      bin: '',
      qualityGrade: 'A',
      expiryDate: '',
      specifications: {},
    });
    setOpenDialog(true);
  };

  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name || '',
      description: material.description || '',
      category: material.category || '',
      subCategory: material.subCategory || '',
      unit: material.unit || '',
      quantityAvailable: material.quantityAvailable || 0,
      minStockLevel: material.minStockLevel || 10,
      maxStockLevel: material.maxStockLevel || 100,
      unitPrice: material.unitPrice || 0,
      supplierName: material.supplier?.name || '',
      supplierContact: material.supplier?.contact || '',
      supplierEmail: material.supplier?.email || '',
      supplierAddress: material.supplier?.address || '',
      warehouse: material.location?.warehouse || '',
      rack: material.location?.rack || '',
      bin: material.location?.bin || '',
      qualityGrade: material.qualityGrade || 'A',
      expiryDate: material.expiryDate ? new Date(material.expiryDate).toISOString().split('T')[0] : '',
      specifications: material.specifications || {},
    });
    setOpenDialog(true);
  };

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setOpenViewDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenViewDialog(false);
    setSelectedMaterial(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      subCategory: '',
      unit: '',
      quantityAvailable: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unitPrice: 0,
      supplierName: '',
      supplierContact: '',
      supplierEmail: '',
      supplierAddress: '',
      warehouse: '',
      rack: '',
      bin: '',
      qualityGrade: 'A',
      expiryDate: '',
      specifications: {},
    });
  };

  const handleSubmit = async () => {
    try {
      console.log('Form submission started', formData);
      
      // Validation for required fields
      if (!formData.name.trim()) {
        setError('Material name is required');
        return;
      }
      if (!formData.category) {
        setError('Category is required');
        return;
      }
      if (!formData.unit) {
        setError('Unit is required');
        return;
      }
      if (!formData.supplierName.trim()) {
        setError('Supplier name is required');
        return;
      }
      if (formData.quantityAvailable < 0) {
        setError('Quantity cannot be negative');
        return;
      }
      if (formData.unitPrice <= 0) {
        setError('Unit price must be greater than 0');
        return;
      }
      if (formData.minStockLevel < 0) {
        setError('Minimum stock level cannot be negative');
        return;
      }
      if (formData.maxStockLevel <= formData.minStockLevel) {
        setError('Maximum stock level must be greater than minimum stock level');
        return;
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subCategory: formData.subCategory.trim(),
        unit: formData.unit,
        quantityAvailable: parseInt(formData.quantityAvailable) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 0,
        maxStockLevel: parseInt(formData.maxStockLevel) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        supplier: {
          name: formData.supplierName.trim(),
          contact: formData.supplierContact.trim(),
          email: formData.supplierEmail.trim(),
          address: formData.supplierAddress.trim(),
        },
        location: {
          warehouse: formData.warehouse.trim(),
          rack: formData.rack.trim(),
          bin: formData.bin.trim(),
        },
        qualityGrade: formData.qualityGrade,
        expiryDate: formData.expiryDate || null,
        specifications: formData.specifications,
      };

      console.log('Submit data prepared:', submitData);

      if (selectedMaterial) {
        console.log('Updating material:', selectedMaterial._id);
        const response = await apiService.updateMaterial(selectedMaterial._id, submitData);
        console.log('Update response:', response);
        setError('');
      } else {
        console.log('Creating new material');
        const response = await apiService.createMaterial(submitData);
        console.log('Create response:', response);
        setError('');
      }
      
      console.log('Fetching updated materials list');
      await fetchMaterials();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving material:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || error.message || 'Failed to save material');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStockStatus = (material) => {
    if (material.quantityAvailable <= material.minStockLevel) {
      return { label: 'Low Stock', color: 'error' };
    }
    if (material.quantityAvailable <= material.minStockLevel * 2) {
      return { label: 'Medium Stock', color: 'warning' };
    }
    return { label: 'Good Stock', color: 'success' };
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
            Materials Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage inventory, track stock levels, and monitor material usage
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddMaterial}
          size="large"
        >
          Add Material
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
                {materials.length}
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
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {materials.filter(m => m.quantityAvailable <= m.minStockLevel).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {materials.reduce((sum, m) => sum + (m.quantityAvailable * m.unitPrice), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Inventory Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {new Set(materials.map(m => m.category)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Materials Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Material Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity Available</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Stock Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => {
                  const stockStatus = getStockStatus(material);
                  return (
                    <TableRow key={material._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {material.serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {material.name}
                        </Typography>
                        {material.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {material.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={material.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {material.quantityAvailable} {material.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Min: {material.minStockLevel} | Max: {material.maxStockLevel}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{material.unitPrice.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total: ₹{(material.quantityAvailable * material.unitPrice).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {material.supplier?.name || 'N/A'}
                        </Typography>
                        {material.supplier?.contact && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {material.supplier.contact}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {material.location?.warehouse || 'N/A'}
                        </Typography>
                        {(material.location?.rack || material.location?.bin) && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {material.location.rack && `Rack: ${material.location.rack}`}
                            {material.location.rack && material.location.bin && ' | '}
                            {material.location.bin && `Bin: ${material.location.bin}`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.label}
                          color={stockStatus.color}
                          size="small"
                          icon={stockStatus.color === 'error' ? <WarningIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleViewMaterial(material)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEditMaterial(material)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Material Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedMaterial ? 'Edit Material' : 'Add New Material'}
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
                label="Material Name *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Required field' : ''}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category *"
                select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                required
                error={!formData.category}
                helperText={!formData.category ? 'Required field' : ''}
              >
                <MenuItem value="">Select Category</MenuItem>
                <MenuItem value="Electronic Components">Electronic Components</MenuItem>
                <MenuItem value="Mechanical Parts">Mechanical Parts</MenuItem>
                <MenuItem value="Raw Materials">Raw Materials</MenuItem>
                <MenuItem value="Packaging Materials">Packaging Materials</MenuItem>
                <MenuItem value="Tools & Equipment">Tools & Equipment</MenuItem>
                <MenuItem value="Testing Equipment">Testing Equipment</MenuItem>
                <MenuItem value="Consumables">Consumables</MenuItem>
                <MenuItem value="Hardware">Hardware</MenuItem>
                <MenuItem value="Software Components">Software Components</MenuItem>
                <MenuItem value="Safety Equipment">Safety Equipment</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sub Category"
                value={formData.subCategory}
                onChange={(e) => handleFormChange('subCategory', e.target.value)}
                helperText="Optional field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quality Grade"
                select
                value={formData.qualityGrade}
                onChange={(e) => handleFormChange('qualityGrade', e.target.value)}
                helperText="Optional (defaults to Grade A)"
              >
                <MenuItem value="A">Grade A</MenuItem>
                <MenuItem value="B">Grade B</MenuItem>
                <MenuItem value="C">Grade C</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={3}
                helperText="Optional - Detailed description of the material"
              />
            </Grid>

            {/* Inventory Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Inventory Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit *"
                select
                value={formData.unit}
                onChange={(e) => handleFormChange('unit', e.target.value)}
                required
                error={!formData.unit}
                helperText={!formData.unit ? 'Required field' : ''}
              >
                <MenuItem value="">Select Unit</MenuItem>
                <MenuItem value="pcs">Pieces</MenuItem>
                <MenuItem value="kg">Kilograms</MenuItem>
                <MenuItem value="gm">Grams</MenuItem>
                <MenuItem value="ltr">Liters</MenuItem>
                <MenuItem value="ml">Milliliters</MenuItem>
                <MenuItem value="mt">Meters</MenuItem>
                <MenuItem value="ft">Feet</MenuItem>
                <MenuItem value="mt2">Square Meters</MenuItem>
                <MenuItem value="set">Set</MenuItem>
                <MenuItem value="box">Box</MenuItem>
                <MenuItem value="roll">Roll</MenuItem>
                <MenuItem value="sheet">Sheet</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Current Quantity *"
                type="number"
                value={formData.quantityAvailable}
                onChange={(e) => handleFormChange('quantityAvailable', e.target.value)}
                required
                inputProps={{ min: 0 }}
                error={formData.quantityAvailable < 0}
                helperText={formData.quantityAvailable < 0 ? 'Must be 0 or greater' : 'Required field'}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit Price (₹) *"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleFormChange('unitPrice', e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                error={formData.unitPrice <= 0}
                helperText={formData.unitPrice <= 0 ? 'Must be greater than 0' : 'Required field'}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock Level *"
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleFormChange('minStockLevel', e.target.value)}
                required
                inputProps={{ min: 0 }}
                error={formData.minStockLevel < 0}
                helperText={formData.minStockLevel < 0 ? 'Must be 0 or greater' : 'Required field'}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Stock Level *"
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => handleFormChange('maxStockLevel', e.target.value)}
                required
                inputProps={{ min: 0 }}
                error={formData.maxStockLevel <= formData.minStockLevel}
                helperText={formData.maxStockLevel <= formData.minStockLevel ? 'Must be greater than minimum' : 'Required field'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Optional - Leave blank if no expiry date"
              />
            </Grid>

            {/* Supplier Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Supplier Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Name *"
                value={formData.supplierName}
                onChange={(e) => handleFormChange('supplierName', e.target.value)}
                required
                error={!formData.supplierName.trim()}
                helperText={!formData.supplierName.trim() ? 'Required field' : ''}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Contact"
                value={formData.supplierContact}
                onChange={(e) => handleFormChange('supplierContact', e.target.value)}
                helperText="Optional - Phone number or contact person"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Email"
                type="email"
                value={formData.supplierEmail}
                onChange={(e) => handleFormChange('supplierEmail', e.target.value)}
                helperText="Optional - Email address for orders"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Address"
                value={formData.supplierAddress}
                onChange={(e) => handleFormChange('supplierAddress', e.target.value)}
                multiline
                rows={2}
                helperText="Optional - Full address of supplier"
              />
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Storage Location (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Warehouse"
                value={formData.warehouse}
                onChange={(e) => handleFormChange('warehouse', e.target.value)}
                helperText="Optional - Warehouse identifier"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rack"
                value={formData.rack}
                onChange={(e) => handleFormChange('rack', e.target.value)}
                helperText="Optional - Rack number"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bin"
                value={formData.bin}
                onChange={(e) => handleFormChange('bin', e.target.value)}
                helperText="Optional - Bin location"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedMaterial ? 'Update' : 'Add'} Material
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Material Dialog (Read-only) */}
      <Dialog open={openViewDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Material Details - {selectedMaterial?.name}
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.serialNumber}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Material Name</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.name}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Chip label={selectedMaterial.category} variant="outlined" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Sub Category</Typography>
                <Typography variant="body1">{selectedMaterial.subCategory || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Quality Grade</Typography>
                <Chip label={`Grade ${selectedMaterial.qualityGrade}`} color="success" size="small" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                <Typography variant="body1">
                  {selectedMaterial.expiryDate ? new Date(selectedMaterial.expiryDate).toLocaleDateString() : 'No Expiry'}
                </Typography>
              </Grid>
              
              {selectedMaterial.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedMaterial.description}</Typography>
                </Grid>
              )}

              {/* Inventory Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Inventory Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Unit</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.unit}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Current Quantity</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedMaterial.quantityAvailable} {selectedMaterial.unit}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Unit Price</Typography>
                <Typography variant="body1" fontWeight={600}>
                  ₹{selectedMaterial.unitPrice?.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Total Value</Typography>
                <Typography variant="body1" fontWeight={600}>
                  ₹{((selectedMaterial.quantityAvailable || 0) * (selectedMaterial.unitPrice || 0)).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Stock Levels</Typography>
                <Typography variant="body1">
                  Min: {selectedMaterial.minStockLevel} | Max: {selectedMaterial.maxStockLevel}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Stock Status</Typography>
                <Chip 
                  label={getStockStatus(selectedMaterial).label} 
                  color={getStockStatus(selectedMaterial).color}
                  icon={getStockStatus(selectedMaterial).color === 'error' ? <WarningIcon /> : undefined}
                />
              </Grid>

              {/* Supplier Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Supplier Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Supplier Name</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.supplier?.name}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Typography variant="body1">{selectedMaterial.supplier?.contact || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedMaterial.supplier?.email || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{selectedMaterial.supplier?.address || 'N/A'}</Typography>
              </Grid>

              {/* Location Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Storage Location
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Warehouse</Typography>
                <Typography variant="body1">{selectedMaterial.location?.warehouse || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Rack</Typography>
                <Typography variant="body1">{selectedMaterial.location?.rack || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Bin</Typography>
                <Typography variant="body1">{selectedMaterial.location?.bin || 'N/A'}</Typography>
              </Grid>

              {/* Timestamps */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Record Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                <Typography variant="body1">
                  {selectedMaterial.createdAt ? new Date(selectedMaterial.createdAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body1">
                  {selectedMaterial.updatedAt ? new Date(selectedMaterial.updatedAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="contained" onClick={() => {
            setOpenViewDialog(false);
            handleEditMaterial(selectedMaterial);
          }}>
            Edit Material
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Materials;
