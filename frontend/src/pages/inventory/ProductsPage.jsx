import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton,
  Chip, TextField, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchProducts = async (query = '') => {
    try {
      const res = await API.get(`/api/inventory/products/${query ? `?search=${query}` : ''}`);
      setProducts(res.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch products', { variant: 'error' });
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Products</Typography>
        {user?.role === 'inventory_manager' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/products/new')}
          >
            Add Product
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by SKU, Name, or Description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Total Stock</TableCell>
              <TableCell>UoM</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No products found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{row.sku}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category_name || '-'}</TableCell>
                  <TableCell>{parseFloat(row.total_stock).toFixed(2)}</TableCell>
                  <TableCell>{row.unit_of_measure}</TableCell>
                  <TableCell>
                    {row.is_low_stock ? (
                      <Chip label="Low Stock" color="error" size="small" />
                    ) : (
                      <Chip label="OK" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/products/${row.id}`)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductsPage;
