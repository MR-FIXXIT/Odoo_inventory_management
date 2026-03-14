import { useState, useEffect } from 'react';
import { 
  Typography, Grid, Paper, Box, CircularProgress, 
  Card, CardContent, Button, ButtonGroup, Chip, Divider
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Warning as WarningIcon,
  Input as ReceiptIcon,
  LocalShipping as DeliveryIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

const KanbanCard = ({ title, value, icon, color, loading, onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderColor: color,
      },
      borderTop: `4px solid ${color}`,
      position: 'relative'
    }}
    onClick={onClick}
  >
    <CardContent sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529', mb: 1 }}>
            {loading ? <CircularProgress size={24} /> : value}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: `${color}15`, 
          color: color,
          display: 'flex'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
    <Divider />
    <Box sx={{ px: 3, py: 1.5, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" sx={{ color: color, fontWeight: 600 }}>
        View Details
      </Typography>
      <NavigateNextIcon fontSize="small" sx={{ color: color }} />
    </Box>
  </Card>
);

import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const DashboardPage = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKPIs = async () => {
      setLoading(true);
      try {
        const res = await API.get('/api/inventory/dashboard/kpis/');
        setKpis(res.data);
      } catch (error) {
        console.error('Failed to fetch KPIs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Inventory Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button startIcon={<FilterIcon />} color="inherit" sx={{ color: 'text.secondary' }}>
            Filters
          </Button>
          <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: '#fff' }}>
            <Button 
              variant={filter === 'ALL' ? 'contained' : 'outlined'} 
              color="primary"
              onClick={() => setFilter('ALL')}
            >
              All Warehouses
            </Button>
            <Button 
              variant={filter === 'MAIN' ? 'contained' : 'outlined'} 
              color="primary"
              onClick={() => setFilter('MAIN')}
            >
              Main Store
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KanbanCard 
            title="Total Products in Stock" 
            value={kpis?.total_products || 0} 
            icon={<ProductIcon />} 
            color="#714B67" // Odoo Primary
            loading={loading}
            onClick={() => navigate('/products')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KanbanCard 
            title="Low Stock Items" 
            value={kpis?.low_stock_count || 0} 
            icon={<WarningIcon />} 
            color="#E63946" // Red for alert
            loading={loading}
            onClick={() => navigate('/products')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KanbanCard 
            title="Pending Receipts" 
            value={kpis?.pending_receipts || 0} 
            icon={<ReceiptIcon />} 
            color="#017E84" // Odoo Secondary
            loading={loading}
            onClick={() => navigate('/operations/receipts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KanbanCard 
            title="Pending Deliveries" 
            value={kpis?.pending_deliveries || 0} 
            icon={<DeliveryIcon />} 
            color="#F4A261" // Warning orange
            loading={loading}
            onClick={() => navigate('/operations/deliveries')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
