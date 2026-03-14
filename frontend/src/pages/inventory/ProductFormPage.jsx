import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axiosInstance';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  MenuItem, Divider, CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = id !== 'new';
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit_of_measure: 'units',
    reorder_level: '0.00'
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const catRes = await API.get('/api/inventory/categories/');
        setCategories(catRes.data);
      } catch (error) {
        enqueueSnackbar('Failed to load categories', { variant: 'error' });
      }
    };
    fetchOptions();
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await API.get(`/api/inventory/products/${id}/`);
          setFormData({
            sku: res.data.sku || '',
            name: res.data.name || '',
            description: res.data.description || '',
            category: res.data.category || '',
            unit_of_measure: res.data.unit_of_measure || 'units',
            reorder_level: res.data.reorder_level || '0.00'
          });
        } catch (error) {
          enqueueSnackbar('Failed to load product', { variant: 'error' });
          navigate('/products');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate, enqueueSnackbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.patch(`/api/inventory/products/${id}/`, formData);
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        const payload = { ...formData };
        if (!payload.category) delete payload.category;
        await API.post('/api/inventory/products/', payload);
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }
      navigate('/products');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.sku?.[0] || 'Failed to save product', { variant: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {isEdit ? formData.name : 'New Product'}
        </Typography>
        <Box>
          <Button variant="outlined" onClick={() => navigate('/products')} sx={{ mr: 2, bgcolor: '#ffffff' }}>
            Discard
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Box>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, maxWidth: 900 }}>
        
        {/* Title area replacing complex headers */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary">Product Name</Typography>
          <TextField
             fullWidth
             variant="standard"
             required
             value={formData.name}
             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
             placeholder="e.g. Desk Chair"
             InputProps={{
               disableUnderline: true,
               sx: { fontSize: '2rem', fontWeight: 700, color: '#212529' }
             }}
          />
          <Divider sx={{ my: 2 }} />
        </Box>

        <Grid container spacing={6}>
          {/* General Information Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>General Information</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                required
                label="SKU (Stock Keeping Unit)"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                size="small"
              />
              <TextField
                fullWidth
                select
                label="Product Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                size="small"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Internal Notes"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                size="small"
              />
            </Box>
          </Grid>

          {/* Inventory Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Inventory</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                required
                label="Unit of Measure"
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                label="Reorder Level"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                size="small"
                helperText="Triggers low stock warnings"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProductFormPage;
