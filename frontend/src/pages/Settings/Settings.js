import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  RestoreFromTrash as RestoreIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      lowStock: true,
      maintenanceAlerts: true,
      taskDeadlines: true,
      systemUpdates: false,
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataSharing: false,
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
    },
    system: {
      autoSave: true,
      sessionTimeout: 30,
      defaultPageSize: 20,
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [exportDataDialog, setExportDataDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState('ri_' + Math.random().toString(36).substring(2, 15));

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // In a real app, this would fetch user settings from the API
      // For now, we'll use localStorage to persist settings
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would save to the API
      localStorage.setItem('userSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setConfirmDialog(true);
  };

  const confirmReset = () => {
    setSettings({
      notifications: {
        email: true,
        browser: true,
        lowStock: true,
        maintenanceAlerts: true,
        taskDeadlines: true,
        systemUpdates: false,
      },
      privacy: {
        profileVisibility: 'team',
        activityTracking: true,
        dataSharing: false,
      },
      appearance: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
      },
      system: {
        autoSave: true,
        sessionTimeout: 30,
        defaultPageSize: 20,
      }
    });
    localStorage.removeItem('userSettings');
    setConfirmDialog(false);
    toast.success('Settings reset to defaults!');
  };

  const exportUserData = async () => {
    try {
      // In a real app, this would call an API to export user data
      const userData = {
        profile: user,
        settings: settings,
        exportDate: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `rishabh-data-${user?.name?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportDataDialog(false);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const generateNewApiKey = () => {
    // In a real app, this would generate a new API key via the backend
    toast.success('New API key generated!');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customize your experience and manage your account preferences
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={resetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Notifications Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Choose what notifications you want to receive
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.browser}
                      onChange={(e) => handleSettingChange('notifications', 'browser', e.target.checked)}
                    />
                  }
                  label="Browser Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.lowStock}
                      onChange={(e) => handleSettingChange('notifications', 'lowStock', e.target.checked)}
                    />
                  }
                  label="Low Stock Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.maintenanceAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'maintenanceAlerts', e.target.checked)}
                    />
                  }
                  label="Maintenance Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.taskDeadlines}
                      onChange={(e) => handleSettingChange('notifications', 'taskDeadlines', e.target.checked)}
                    />
                  }
                  label="Task Deadlines"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.systemUpdates}
                      onChange={(e) => handleSettingChange('notifications', 'systemUpdates', e.target.checked)}
                    />
                  }
                  label="System Updates"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Privacy & Security
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Control your privacy and data sharing preferences
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={settings.privacy.profileVisibility}
                    label="Profile Visibility"
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                  >
                    <MenuItem value="public">Everyone</MenuItem>
                    <MenuItem value="team">Team Members Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.activityTracking}
                      onChange={(e) => handleSettingChange('privacy', 'activityTracking', e.target.checked)}
                    />
                  }
                  label="Activity Tracking"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                    />
                  }
                  label="Data Sharing for Analytics"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Appearance
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customize the look and feel of your interface
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.appearance.theme}
                    label="Theme"
                    onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.appearance.language}
                    label="Language"
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
                    <MenuItem value="mr">मराठी (Marathi)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.appearance.dateFormat}
                    label="Date Format"
                    onChange={(e) => handleSettingChange('appearance', 'dateFormat', e.target.value)}
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                System Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Configure system behavior and performance
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.system.autoSave}
                      onChange={(e) => handleSettingChange('system', 'autoSave', e.target.checked)}
                    />
                  }
                  label="Auto-save Changes"
                />
                
                <FormControl fullWidth>
                  <InputLabel>Session Timeout (minutes)</InputLabel>
                  <Select
                    value={settings.system.sessionTimeout}
                    label="Session Timeout (minutes)"
                    onChange={(e) => handleSettingChange('system', 'sessionTimeout', e.target.value)}
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                    <MenuItem value={0}>Never</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Default Page Size</InputLabel>
                  <Select
                    value={settings.system.defaultPageSize}
                    label="Default Page Size"
                    onChange={(e) => handleSettingChange('system', 'defaultPageSize', e.target.value)}
                  >
                    <MenuItem value={10}>10 items</MenuItem>
                    <MenuItem value={20}>20 items</MenuItem>
                    <MenuItem value={50}>50 items</MenuItem>
                    <MenuItem value={100}>100 items</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* API & Integration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                API & Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Manage API keys and third-party integrations
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Alert severity="info">
                  Use your API key to integrate with external systems and automate workflows.
                </Alert>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    fullWidth
                    label="API Key"
                    value={showApiKey ? apiKey : '•'.repeat(apiKey.length)}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip title={showApiKey ? 'Hide API Key' : 'Show API Key'}>
                          <IconButton onClick={() => setShowApiKey(!showApiKey)}>
                            {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                  <Button variant="outlined" onClick={generateNewApiKey}>
                    Generate New
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Data Management
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Export your data or manage your account
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => setExportDataDialog(true)}
                >
                  Export My Data
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteAccountDialog(true)}
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialogs */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmReset} color="primary" variant="contained">
            Reset Settings
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportDataDialog} onClose={() => setExportDataDialog(false)}>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This will download a JSON file containing all your profile data, settings, and activity history.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            The exported file will not contain sensitive information like passwords.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDataDialog(false)}>Cancel</Button>
          <Button onClick={exportUserData} color="primary" variant="contained">
            Download Data
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteAccountDialog} onClose={() => setDeleteAccountDialog(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is permanent and cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography gutterBottom>
            To confirm account deletion, please type your email address below:
          </Typography>
          <TextField
            fullWidth
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={user?.email}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteAccountDialog(false);
            setConfirmationText('');
          }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={confirmationText !== user?.email}
            onClick={() => {
              // In a real app, this would call an API to delete the account
              toast.error('Account deletion is not implemented in this demo');
              setDeleteAccountDialog(false);
              setConfirmationText('');
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
