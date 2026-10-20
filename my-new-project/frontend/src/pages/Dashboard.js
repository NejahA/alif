import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  ShoppingCart,
  People,
  TrendingUp,
  RecentActors,
  Add,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    recentItems: [],
    userActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Fetch items
      const itemsResponse = await fetch('http://localhost:5000/api/items', { headers });
      const items = await itemsResponse.json();

      // Calculate stats
      const totalItems = items.length;
      const recentItems = items.slice(0, 5);

      // Mock user activity for demo
      const userActivity = [
        { user: user?.username || 'Guest', action: 'Logged in', timestamp: new Date().toISOString() },
        { user: 'Admin', action: 'Created new item', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { user: 'User1', action: 'Updated profile', timestamp: new Date(Date.now() - 7200000).toISOString() },
      ];

      setStats({ totalItems, recentItems, userActivity });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Typography variant="h5">
                  {stats.totalItems}
                </Typography>
              </Box>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Button
                size="small"
                component={Link}
                to="/items"
                startIcon={<Add />}
              >
                Add New
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h5">
                  {stats.recentItems.length}
                </Typography>
              </Box>
              <Typography color="textSecondary" gutterBottom>
                Recent Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h5">
                  5
                </Typography>
              </Box>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <RecentActors />
                </Avatar>
                <Typography variant="h5">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </Typography>
              </Box>
              <Typography color="textSecondary" gutterBottom>
                Your Role
              </Typography>
              <Chip
                label={user?.role || 'Guest'}
                color={user?.role === 'admin' ? 'primary' : 'default'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Items
            </Typography>
            {stats.recentItems.length > 0 ? (
              <List>
                {stats.recentItems.map((item, index) => (
                  <React.Fragment key={item._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`Quantity: ${item.quantity}`}
                      />
                      <Chip
                        label={item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        color={item.quantity > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    {index < stats.recentItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                No items found
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {stats.userActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'grey.300' }}>
                        {activity.user.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.user} • ${new Date(activity.timestamp).toLocaleString()}`}
                    />
                    {activity.action.includes('Created') && <CheckCircle color="success" />}
                    {activity.action.includes('Updated') && <Warning color="warning" />}
                    {activity.action.includes('Error') && <Error color="error" />}
                  </ListItem>
                  {index < stats.userActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;