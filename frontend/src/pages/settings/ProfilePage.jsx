import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, Divider, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Person as PersonIcon, Email as EmailIcon, Badge as BadgeIcon } from '@mui/icons-material';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        My Profile
      </Typography>

      <Card sx={{ mb: 4, overflow: 'visible', mt: 8 }}>
        <Box sx={{ bgcolor: 'primary.main', height: 100, position: 'relative' }}>
          <Avatar 
            sx={{ 
              width: 100, height: 100, 
              position: 'absolute', bottom: -50, left: 32,
              border: '4px solid', borderColor: 'background.paper',
              bgcolor: 'primary.dark', fontSize: '2.5rem'
            }}
          >
            {user.loginid?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
        <CardContent sx={{ pt: 8, px: 4, pb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {user.full_name || 'No Name Provided'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'capitalize', mb: 3 }}>
            {user.role?.replace('_', ' ')}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BadgeIcon color="action" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Login ID</Typography>
                  <Typography variant="body1" fontWeight={500}>{user.loginid}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="action" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" fontWeight={500}>{user.email}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="action" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Role Code</Typography>
                  <Typography variant="body1" fontWeight={500}>{user.role}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="primary">
              Change Password
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
