import { useState } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Typography, Avatar, 
  Divider, IconButton, useTheme 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductIcon,
  Input as ReceiptIcon,
  LocalShipping as DeliveryIcon,
  SwapHoriz as TransferIcon,
  Calculate as AdjustmentIcon,
  History as HistoryIcon,
  Warehouse as WarehouseIcon,
  Person as ProfilIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export const DRAWER_WIDTH = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { type: 'divider' },
    { label: 'Products', path: '/products', icon: <ProductIcon /> },
    { type: 'divider' },
    { label: 'Receipts', path: '/operations/receipts', icon: <ReceiptIcon /> },
    { label: 'Deliveries', path: '/operations/deliveries', icon: <DeliveryIcon /> },
    { label: 'Transfers', path: '/operations/transfers', icon: <TransferIcon /> },
    { label: 'Adjustments', path: '/operations/adjustments', icon: <AdjustmentIcon /> },
    { type: 'divider' },
    { label: 'Move History', path: '/moves', icon: <HistoryIcon /> },
    { type: 'divider' },
    { label: 'Warehouses', path: '/settings/warehouses', icon: <WarehouseIcon />, roles: ['inventory_manager', 'admin'] },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#212529', color: '#fff' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff', letterSpacing: 1 }}>
            CoreInventory
          </Typography>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* User Profile Area */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', width: 40, height: 40 }}>
          {user?.loginid?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        {!collapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {user?.full_name || user?.loginid}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }} noWrap>
              {user?.role?.replace('_', ' ')}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 1, overflowY: 'auto' }}>
        {navItems.map((item, index) => {
          if (item.type === 'divider') {
            return <Divider key={`div-${index}`} sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />;
          }

          // Role check
          if (item.roles && user && !item.roles.includes(user.role)) return null;

          const isActive = location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: 2,
                  py: 1,
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: collapsed ? 0 : 36, 
                  color: isActive ? theme.palette.primary.light : 'rgba(255,255,255,0.7)',
                  justifyContent: 'center' 
                }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.7)'
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ p: 2 }}>
        <List disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/profile')}
              sx={{ borderRadius: 1, justifyContent: collapsed ? 'center' : 'flex-start', px: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'rgba(255,255,255,0.7)' }}><ProfilIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }} />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{ borderRadius: 1, justifyContent: collapsed ? 'center' : 'flex-start', px: 2, py: 1, color: theme.palette.error.light }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit' }}><LogoutIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: collapsed ? 80 : DRAWER_WIDTH }, flexShrink: { sm: 0 }, transition: 'width 0.2s' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: collapsed ? 80 : DRAWER_WIDTH, transition: 'width 0.2s', borderRight: 'none' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
