import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

function Profile({ user }) {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }));
      // Fetch user activity (mock data for now)
      setActivity([
        { id: 1, action: 'Logged in', timestamp: new Date().toISOString() },
        { id: 2, action: 'Updated profile', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, action: 'Created new item', timestamp: new Date(Date.now() - 172800000).toISOString() },
        { id: 4, action: 'Viewed dashboard', timestamp: new Date(Date.now() - 259200000).toISOString() },
      ]);
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editing) {
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
    setEditing(!editing);
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      
      // Update profile
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        
        // In a real app, you would have an endpoint for password change
        // For now, just update username/email
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profileData.username,
          email: profileData.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setEditing(false);
        
        // Update user data in parent component would be handled by a callback
        // For now, just show success message
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Alert severity="warning">
            You need to be logged in to view your profile
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: 48,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" gutterBottom>
                  {user.username}
                </Typography>
                
                <Chip
                  label={user.role}
                  color={user.role === 'admin' ? 'primary' : 'default'}
                  sx={{ mb: 2 }}
                />
                
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <EmailIcon />
                    </ListItemAvatar>
                    <ListItemText primary="Email" secondary={user.email} />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemAvatar>
                      <PersonIcon />
                    </ListItemAvatar>
                    <ListItemText primary="Member Since" secondary={
                      user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'
                    } />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemAvatar>
                      <SecurityIcon />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Account Status" 
                      secondary="Active"
                      secondaryTypographyProps={{
                        color: 'success.main',
                        fontWeight: 'bold'
                      }}
                    />
                  </ListItem>
                </List>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant={editing ? 'outlined' : 'contained'}
                  startIcon={editing ? <CancelIcon /> : <EditIcon />}
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
                    <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                    <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
                  </Tabs>
                </Box>

                {message.text && (
                  <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                  </Alert>
                )}

                {tabValue === 0 && (
                  <Box component="form">
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Username"
                          name="username"
                          value={profileData.username}
                          onChange={handleChange}
                          disabled={!editing}
                          InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleChange}
                          disabled={!editing}
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                          }}
                        />
                      </Grid>

                      {editing && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              onClick={handleEditToggle}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleSave}
                              disabled={loading}
                              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Change your password here. Make sure it's secure!
                    </Alert>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          name="currentPassword"
                          type="password"
                          value={profileData.currentPassword}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="newPassword"
                          type="password"
                          value={profileData.newPassword}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirmPassword"
                          type="password"
                          value={profileData.confirmPassword}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={() => setOpenDialog(true)}
                          disabled={loading}
                        >
                          Update Password
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    
                    {activity.length > 0 ? (
                      <List>
                        {activity.map((item) => (
                          <React.Fragment key={item.id}>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'grey.100' }}>
                                  <HistoryIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={item.action}
                                secondary={new Date(item.timestamp).toLocaleString()}
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                        No activity found
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Password</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update your password? You will need to login again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;