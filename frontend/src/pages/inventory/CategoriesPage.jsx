import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import API from '../../api/axiosInstance';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '' });
  const { enqueueSnackbar } = useSnackbar();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get('/api/inventory/categories/');
      setCategories(res.data);
    } catch (error) {
      enqueueSnackbar('Failed to load categories', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpen = (category = null) => {
    if (category) {
      setFormData(category);
      setIsEdit(true);
    } else {
      setFormData({ id: null, name: '', description: '' });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      if (isEdit) {
        await API.patch(`/api/inventory/categories/${formData.id}/`, {
          name: formData.name,
          description: formData.description
        });
        enqueueSnackbar('Category updated', { variant: 'success' });
      } else {
        await API.post('/api/inventory/categories/', {
          name: formData.name,
          description: formData.description
        });
        enqueueSnackbar('Category created', { variant: 'success' });
      }
      handleClose();
      fetchCategories();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.name?.[0] || 'Failed to save category', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/api/inventory/categories/${id}/`);
      enqueueSnackbar('Category deleted', { variant: 'success' });
      fetchCategories();
    } catch (error) {
      enqueueSnackbar('Cannot delete category (it may be in use)', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Product Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          New Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{cat.name}</TableCell>
                <TableCell>{cat.description || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(cat)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(cat.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No categories found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Category Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
