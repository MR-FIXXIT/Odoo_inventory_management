import { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Breadcrumbs, 
  Link, IconButton, InputBase, Avatar, Menu, MenuItem,
  Divider, Paper
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon, 
  Search as SearchIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

export default function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  // Generate breadcrumbs from path
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const formatBreadcrumb = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).replace('-', ' ');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
        bgcolor: '#ffffff',
        borderBottom: '1px solid #dee2e6',
        color: '#212529'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '56px !important' }}>
        
        {/* Left Side: Breadcrumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" sx={{ color: '#adb5bd' }}/>}
            aria-label="breadcrumb"
            sx={{ '& .MuiBreadcrumbs-li': { fontWeight: 500, fontSize: '1rem' } }}
          >
            <Link underline="hover" color="inherit" onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer' }}>
              Inventory
            </Link>
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              return last ? (
                <Typography color="text.primary" key={to} sx={{ fontWeight: 600 }}>
                  {formatBreadcrumb(value)}
                </Typography>
              ) : (
                <Link underline="hover" color="inherit" onClick={() => navigate(to)} key={to} sx={{ cursor: 'pointer' }}>
                  {formatBreadcrumb(value)}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Right Side: Search & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex', alignItems: 'center', width: 250, 
              border: '1px solid #dee2e6', borderRadius: '4px',
              bgcolor: '#f8f9fa', px: 1, py: '2px'
            }}
          >
            <SearchIcon sx={{ color: '#adb5bd', fontSize: 20 }} />
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Paper>

          <Box onClick={handleProfileMenuOpen} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1 }}>
            <Avatar 
              sx={{ width: 32, height: 32, bgcolor: '#714B67', fontSize: '1rem', fontWeight: 600 }}
            >
              {user?.loginid?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
              {user?.full_name || user?.loginid}
            </Typography>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 4,
              sx: { mt: 1.5, minWidth: 200, borderRadius: 2 }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>{user?.full_name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{textTransform:'capitalize'}}>
                {user?.role?.replace('_', ' ')}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} /> My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
